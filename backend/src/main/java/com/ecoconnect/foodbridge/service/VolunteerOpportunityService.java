package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VolunteerOpportunityService {

    private static final Logger log = LoggerFactory.getLogger(VolunteerOpportunityService.class);

    private final VolunteerOpportunityRepository opportunityRepository;
    private final VolunteerParticipationRepository participationRepository;
    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;
    private final CharityRepository charityRepository;
    private final AnimalOrganizationRepository animalOrgRepository;
    private final ActivityRecordRepository activityRecordRepository;
    private final ImpactRecordRepository impactRecordRepository;
    private final VerificationGuardService verificationGuardService;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    public VolunteerOpportunityService(VolunteerOpportunityRepository opportunityRepository,
                                     VolunteerParticipationRepository participationRepository,
                                     VolunteerRepository volunteerRepository,
                                     UserRepository userRepository,
                                     CharityRepository charityRepository,
                                     AnimalOrganizationRepository animalOrgRepository,
                                     ActivityRecordRepository activityRecordRepository,
                                     ImpactRecordRepository impactRecordRepository,
                                     VerificationGuardService verificationGuardService,
                                     AuditLogService auditLogService,
                                     EmailService emailService) {
        this.opportunityRepository = opportunityRepository;
        this.participationRepository = participationRepository;
        this.volunteerRepository = volunteerRepository;
        this.userRepository = userRepository;
        this.charityRepository = charityRepository;
        this.animalOrgRepository = animalOrgRepository;
        this.activityRecordRepository = activityRecordRepository;
        this.impactRecordRepository = impactRecordRepository;
        this.verificationGuardService = verificationGuardService;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    /**
     * Charities, Animal Organizations, or Admins create a volunteer opportunity.
     */
    @Transactional
    public VolunteerOpportunityResponseDto createOpportunity(String userEmail, VolunteerOpportunityCreateDto dto, String ipAddress) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        String organizerName;
        String organizerType;
        Charity charity = null;
        AnimalOrganization animalOrg = null;

        if (user.getRole() == Role.CHARITY) {
            charity = verificationGuardService.assertCharityVerifiedForPublishing(user);
            organizerName = charity.getCharityName();
            organizerType = "CHARITY";
        } else if (user.getRole() == Role.ANIMAL_ORG) {
            animalOrg = animalOrgRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Animal organization profile not found for user: " + userEmail));
            if (animalOrg.getVerificationStatus() != VerificationStatus.VERIFIED) {
                throw new BadRequestException("Only verified animal welfare organizations can post volunteer opportunities.");
            }
            organizerName = animalOrg.getOrganizationName();
            organizerType = "ANIMAL_ORG";
        } else if (user.getRole() == Role.ADMIN) {
            organizerName = "FoodBridge Community Initiatives";
            organizerType = "ADMIN";
        } else {
            throw new AccessDeniedException("Only verified charities, animal organizations, or admins can publish volunteer opportunities.");
        }

        VolunteerOpportunity opp = VolunteerOpportunity.builder()
                .organizerUser(user)
                .charity(charity)
                .animalOrg(animalOrg)
                .organizerName(organizerName)
                .organizerType(organizerType)
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .category(dto.getCategory())
                .district(dto.getDistrict().trim())
                .city(dto.getCity())
                .addressLine(dto.getAddressLine())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .eventDate(dto.getEventDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .estimatedHours(dto.getEstimatedHours() != null ? dto.getEstimatedHours() : BigDecimal.valueOf(2.0))
                .volunteersNeeded(dto.getVolunteersNeeded() != null && dto.getVolunteersNeeded() > 0 ? dto.getVolunteersNeeded() : 1)
                .volunteersRegistered(0)
                .status(OpportunityStatus.ACTIVE)
                .skillsRequired(dto.getSkillsRequired())
                .contactEmail(dto.getContactEmail() != null ? dto.getContactEmail() : user.getEmail())
                .contactPhone(dto.getContactPhone() != null ? dto.getContactPhone() : user.getPhoneNumber())
                .build();

        VolunteerOpportunity saved = opportunityRepository.save(opp);

        auditLogService.record(user, "VOLUNTEER_OPPORTUNITY_CREATED", "VOLUNTEER_OPPORTUNITY",
                saved.getId(), "Created volunteer opportunity: " + saved.getTitle(), ipAddress);

        return VolunteerOpportunityResponseDto.fromEntity(saved);
    }

    /**
     * Browse volunteer opportunities with optional category, district, and search filtering.
     */
    @Transactional(readOnly = true)
    public List<VolunteerOpportunityResponseDto> getPublicOpportunities(
            VolunteerOpportunityCategory category,
            String district,
            String search,
            String currentUserEmail) {

        List<VolunteerOpportunity> list;
        if (category != null) {
            list = opportunityRepository.findByCategoryAndStatusOrderByEventDateAsc(category, OpportunityStatus.ACTIVE);
        } else if (district != null && !district.isBlank()) {
            list = opportunityRepository.findByDistrictIgnoreCaseAndStatusOrderByEventDateAsc(district.trim(), OpportunityStatus.ACTIVE);
        } else {
            list = opportunityRepository.findByStatusOrderByEventDateAsc(OpportunityStatus.ACTIVE);
        }

        // Filter by district if both category & district were provided
        if (category != null && district != null && !district.isBlank()) {
            list = list.stream()
                    .filter(o -> o.getDistrict().equalsIgnoreCase(district.trim()))
                    .toList();
        }

        // Search by keyword if provided
        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase();
            list = list.stream()
                    .filter(o -> o.getTitle().toLowerCase().contains(query)
                            || o.getDescription().toLowerCase().contains(query)
                            || (o.getCity() != null && o.getCity().toLowerCase().contains(query))
                            || o.getOrganizerName().toLowerCase().contains(query))
                    .toList();
        }

        // Annotate with user participation if logged in
        Map<UUID, VolunteerParticipation> userParticipations = new HashMap<>();
        if (currentUserEmail != null) {
            userRepository.findByEmail(currentUserEmail).ifPresent(user -> {
                participationRepository.findByUserIdOrderByRegisteredAtDesc(user.getId())
                        .forEach(p -> userParticipations.put(p.getOpportunity().getId(), p));
            });
        }

        return list.stream().map(opp -> {
            VolunteerOpportunityResponseDto dto = VolunteerOpportunityResponseDto.fromEntity(opp);
            VolunteerParticipation part = userParticipations.get(opp.getId());
            if (part != null) {
                dto.setIsUserRegistered(part.getStatus() != ParticipationStatus.CANCELLED);
                dto.setUserParticipationStatus(part.getStatus().name());
            } else {
                dto.setIsUserRegistered(false);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Retrieve single opportunity by ID.
     */
    @Transactional(readOnly = true)
    public VolunteerOpportunityResponseDto getOpportunityDetails(UUID id, String currentUserEmail) {
        VolunteerOpportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer opportunity not found: " + id));

        VolunteerOpportunityResponseDto dto = VolunteerOpportunityResponseDto.fromEntity(opp);
        if (currentUserEmail != null) {
            userRepository.findByEmail(currentUserEmail).ifPresent(user -> {
                participationRepository.findByOpportunityIdAndUserId(opp.getId(), user.getId())
                        .ifPresent(part -> {
                            dto.setIsUserRegistered(part.getStatus() != ParticipationStatus.CANCELLED);
                            dto.setUserParticipationStatus(part.getStatus().name());
                        });
            });
        }
        return dto;
    }

    /**
     * User signs up for an opportunity.
     */
    @Transactional
    public VolunteerParticipationDto signUpForOpportunity(String userEmail, UUID opportunityId, VolunteerSignUpDto dto, String ipAddress) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        VolunteerOpportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer opportunity not found: " + opportunityId));

        if (opp.getStatus() != OpportunityStatus.ACTIVE) {
            throw new BadRequestException("This opportunity is no longer active (Status: " + opp.getStatus() + ").");
        }

        if (opp.getEventDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot register for an event that has already occurred.");
        }

        // Check if user is the organizer
        if (opp.getOrganizerUser().getId().equals(user.getId())) {
            throw new BadRequestException("Organizers cannot sign up as a volunteer for their own activity.");
        }

        // Check for existing active registration
        Optional<VolunteerParticipation> existingOpt = participationRepository.findByOpportunityIdAndUserId(opportunityId, user.getId());
        if (existingOpt.isPresent() && existingOpt.get().getStatus() != ParticipationStatus.CANCELLED) {
            throw new BadRequestException("You are already registered for this volunteer activity (Status: " + existingOpt.get().getStatus() + ").");
        }

        // Check capacity
        if (opp.getVolunteersRegistered() >= opp.getVolunteersNeeded()) {
            throw new BadRequestException("This opportunity has reached its maximum volunteer capacity (" + opp.getVolunteersNeeded() + ").");
        }

        // Increment registered count
        opp.setVolunteersRegistered(opp.getVolunteersRegistered() + 1);
        opportunityRepository.save(opp);

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        VolunteerParticipation participation;
        if (existingOpt.isPresent()) {
            participation = existingOpt.get();
            participation.setStatus(ParticipationStatus.REGISTERED);
            participation.setRegisteredAt(now);
            participation.setAttendedAt(null);
            participation.setHoursVolunteered(BigDecimal.ZERO);
            participation.setAttendanceNotes(dto != null ? dto.getNotes() : null);
        } else {
            participation = VolunteerParticipation.builder()
                    .opportunity(opp)
                    .user(user)
                    .status(ParticipationStatus.REGISTERED)
                    .hoursVolunteered(BigDecimal.ZERO)
                    .attendanceNotes(dto != null ? dto.getNotes() : null)
                    .registeredAt(now)
                    .build();
        }

        VolunteerParticipation saved = participationRepository.save(participation);

        // Audit log
        auditLogService.record(user, "VOLUNTEER_SIGNUP", "VOLUNTEER_PARTICIPATION",
                saved.getId(), "User signed up for: " + opp.getTitle(), ipAddress);

        // Dispatches
        try {
            // Notify Organizer
            emailService.sendNewVolunteerSignUpEmail(
                    opp.getOrganizerUser(),
                    opp.getTitle(),
                    user.getFullName(),
                    user.getEmail(),
                    opp.getId()
            );

            // Notify Volunteer
            String location = (opp.getCity() != null ? opp.getCity() + ", " : "") + opp.getDistrict();
            emailService.sendVolunteerRegistrationConfirmationEmail(
                    user,
                    opp.getTitle(),
                    opp.getOrganizerName(),
                    opp.getEventDate().toString(),
                    location,
                    opp.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to dispatch volunteer sign-up notifications: {}", e.getMessage());
        }

        return VolunteerParticipationDto.fromEntity(saved);
    }

    /**
     * User cancels their registration.
     */
    @Transactional
    public VolunteerParticipationDto cancelSignUp(String userEmail, UUID opportunityId, String ipAddress) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        VolunteerParticipation participation = participationRepository.findByOpportunityIdAndUserId(opportunityId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for this opportunity"));

        if (participation.getStatus() == ParticipationStatus.CANCELLED) {
            throw new BadRequestException("Registration is already cancelled.");
        }

        if (participation.getStatus() == ParticipationStatus.ATTENDED) {
            throw new BadRequestException("Cannot cancel a completed attendance record.");
        }

        participation.setStatus(ParticipationStatus.CANCELLED);
        VolunteerParticipation saved = participationRepository.save(participation);

        // Decrement volunteers registered count
        VolunteerOpportunity opp = participation.getOpportunity();
        if (opp.getVolunteersRegistered() > 0) {
            opp.setVolunteersRegistered(opp.getVolunteersRegistered() - 1);
            opportunityRepository.save(opp);
        }

        auditLogService.record(user, "VOLUNTEER_REGISTRATION_CANCELLED", "VOLUNTEER_PARTICIPATION",
                saved.getId(), "User cancelled volunteer registration for: " + opp.getTitle(), ipAddress);

        return VolunteerParticipationDto.fromEntity(saved);
    }

    /**
     * View all participations for the authenticated user (participation history).
     */
    @Transactional(readOnly = true)
    public List<VolunteerParticipationDto> getMyParticipations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return participationRepository.findByUserIdOrderByRegisteredAtDesc(user.getId())
                .stream()
                .map(VolunteerParticipationDto::fromEntity)
                .toList();
    }

    /**
     * Organizer views all registered attendees for an opportunity.
     */
    @Transactional(readOnly = true)
    public List<VolunteerParticipationDto> getOpportunityAttendees(String organizerEmail, UUID opportunityId) {
        User user = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + organizerEmail));

        VolunteerOpportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer opportunity not found: " + opportunityId));

        if (!opp.getOrganizerUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only the organizer or an admin can view opportunity attendees.");
        }

        return participationRepository.findByOpportunityIdOrderByRegisteredAtAsc(opportunityId)
                .stream()
                .map(VolunteerParticipationDto::fromEntity)
                .toList();
    }

    /**
     * Organizer or Admin marks attendance for a registered volunteer:
     * - Status updated to ATTENDED or NO_SHOW
     * - Attended hours recorded
     * - Volunteer profile total_tasks_completed incremented
     * - Verified ActivityRecord and ImpactRecord created to feed Impact Dashboard
     * - Dispatches email and in-app notification
     */
    @Transactional
    public VolunteerParticipationDto markAttendance(
            String organizerEmail,
            UUID opportunityId,
            UUID participationId,
            AttendanceMarkDto dto,
            String ipAddress) {

        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + organizerEmail));

        VolunteerOpportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer opportunity not found: " + opportunityId));

        if (!opp.getOrganizerUser().getId().equals(organizer.getId()) && organizer.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only the organizer or an admin can mark volunteer attendance.");
        }

        VolunteerParticipation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation record not found: " + participationId));

        if (!participation.getOpportunity().getId().equals(opp.getId())) {
            throw new BadRequestException("Participation does not belong to the specified opportunity.");
        }

        ParticipationStatus newStatus = dto.getStatus();
        if (newStatus != ParticipationStatus.ATTENDED && newStatus != ParticipationStatus.NO_SHOW) {
            throw new BadRequestException("Invalid status for attendance: " + newStatus + ". Must be ATTENDED or NO_SHOW.");
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        participation.setStatus(newStatus);
        if (dto.getAttendanceNotes() != null) {
            participation.setAttendanceNotes(dto.getAttendanceNotes().trim());
        }

        if (newStatus == ParticipationStatus.ATTENDED) {
            BigDecimal hours = dto.getHoursVolunteered() != null && dto.getHoursVolunteered().compareTo(BigDecimal.ZERO) > 0
                    ? dto.getHoursVolunteered()
                    : opp.getEstimatedHours();
            participation.setHoursVolunteered(hours);
            participation.setAttendedAt(now);

            // Increment volunteer profile total tasks completed if volunteer profile exists
            volunteerRepository.findByUserId(participation.getUser().getId()).ifPresent(vol -> {
                vol.setTotalTasksCompleted(vol.getTotalTasksCompleted() + 1);
                volunteerRepository.save(vol);
            });

            // Create ActivityRecord to feed Impact Dashboard (Rule 4: Verified + Completed)
            ActivityRecord activityRecord = ActivityRecord.builder()
                    .activityType("VOLUNTEER_WORK")
                    .performedByUser(participation.getUser())
                    .verifiedByUser(organizer)
                    .status(ActivityStatus.COMPLETED)
                    .completionTimestamp(now)
                    .notes(String.format("Volunteered %.1f hrs for '%s' organized by %s (%s)",
                            hours.doubleValue(), opp.getTitle(), opp.getOrganizerName(), opp.getCategory()))
                    .build();
            ActivityRecord savedActivity = activityRecordRepository.save(activityRecord);

            // Calculate impact metrics based on category
            int mealsRescued = 0;
            int peopleFed = 0;
            int animalsFed = 0;
            if (opp.getCategory() == VolunteerOpportunityCategory.FOOD_DISTRIBUTION) {
                // Approximate 15-20 meals/people supported per volunteer session
                peopleFed = Math.max(1, (int) (hours.doubleValue() * 10));
                mealsRescued = peopleFed;
            } else if (opp.getCategory() == VolunteerOpportunityCategory.ANIMAL_WELFARE) {
                animalsFed = Math.max(1, (int) (hours.doubleValue() * 8));
            } else {
                peopleFed = Math.max(1, (int) (hours.doubleValue() * 5));
            }

            ImpactRecord impactRecord = ImpactRecord.builder()
                    .activityRecord(savedActivity)
                    .mealsRescued(mealsRescued)
                    .foodWeightKg(BigDecimal.ZERO)
                    .co2SavingsKg(BigDecimal.ZERO)
                    .peopleFed(peopleFed)
                    .animalsFed(animalsFed)
                    .calculatedAt(now)
                    .build();
            impactRecordRepository.save(impactRecord);

        } else {
            participation.setHoursVolunteered(BigDecimal.ZERO);
            participation.setAttendedAt(null);
        }

        VolunteerParticipation saved = participationRepository.save(participation);

        // Check if all registered volunteers have attendance marked, if so mark opportunity completed
        long remainingUnmarked = participationRepository.countByOpportunityIdAndStatus(opp.getId(), ParticipationStatus.REGISTERED);
        if (remainingUnmarked == 0 && opp.getVolunteersRegistered() > 0) {
            opp.setStatus(OpportunityStatus.COMPLETED);
            opportunityRepository.save(opp);
        }

        // Audit log
        auditLogService.record(organizer, "VOLUNTEER_ATTENDANCE_MARKED", "VOLUNTEER_PARTICIPATION",
                saved.getId(), String.format("Marked %s for %s (%s)",
                        newStatus, participation.getUser().getEmail(), opp.getTitle()), ipAddress);

        // Dispatches
        try {
            boolean attended = newStatus == ParticipationStatus.ATTENDED;
            emailService.sendVolunteerAttendanceMarkedEmail(
                    participation.getUser(),
                    opp.getTitle(),
                    opp.getOrganizerName(),
                    attended,
                    participation.getHoursVolunteered().doubleValue(),
                    opp.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to dispatch volunteer attendance marked email: {}", e.getMessage());
        }

        return VolunteerParticipationDto.fromEntity(saved);
    }
}
