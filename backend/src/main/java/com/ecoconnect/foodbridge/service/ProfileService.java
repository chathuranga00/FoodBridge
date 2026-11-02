package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.BusinessProfileDto;
import com.ecoconnect.foodbridge.dto.CharityProfileDto;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.Charity;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.CharityRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;

    public ProfileService(UserRepository userRepository,
                          BusinessRepository businessRepository,
                          CharityRepository charityRepository) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.charityRepository = charityRepository;
    }

    @Transactional(readOnly = true)
    public BusinessProfileDto getBusinessProfile(String userEmail) {
        User user = getUserByEmail(userEmail);
        return businessRepository.findByUserId(user.getId())
                .map(BusinessProfileDto::fromEntity)
                .orElse(null);
    }

    @Transactional
    public BusinessProfileDto saveOrUpdateBusinessProfile(String userEmail, BusinessProfileDto dto) {
        User user = getUserByEmail(userEmail);
        if (user.getRole() != Role.RESTAURANT && user.getRole() != Role.GROCERY) {
            throw new BadRequestException("Only RESTAURANT or GROCERY accounts can manage business profiles");
        }

        Optional<Business> existing = businessRepository.findByUserId(user.getId());
        Business business;

        if (existing.isPresent()) {
            business = existing.get();
            // Check registration number collision if changed
            if (!business.getRegistrationNumber().equalsIgnoreCase(dto.getRegistrationNumber())) {
                businessRepository.findByRegistrationNumber(dto.getRegistrationNumber()).ifPresent(other -> {
                    if (!other.getId().equals(business.getId())) {
                        throw new BadRequestException("Registration number is already in use by another business");
                    }
                });
            }
        } else {
            if (businessRepository.existsByRegistrationNumber(dto.getRegistrationNumber())) {
                throw new BadRequestException("Registration number is already in use by another business");
            }
            business = new Business();
            business.setUser(user);
        }

        business.setBusinessName(dto.getBusinessName());
        business.setBusinessType(dto.getBusinessType());
        business.setRegistrationNumber(dto.getRegistrationNumber());
        business.setDescription(dto.getDescription());
        business.setLogoUrl(dto.getLogoUrl());
        business.setDocumentUrl(dto.getDocumentUrl());
        business.setContactPerson(dto.getContactPerson());
        business.setContactEmail(dto.getContactEmail() != null ? dto.getContactEmail() : user.getEmail());
        business.setContactPhone(dto.getContactPhone() != null ? dto.getContactPhone() : user.getPhoneNumber());
        business.setAddressLine1(dto.getAddressLine1());
        business.setAddressLine2(dto.getAddressLine2());
        business.setCity(dto.getCity());
        business.setDistrict(dto.getDistrict());
        business.setLatitude(dto.getLatitude());
        business.setLongitude(dto.getLongitude());

        // Always reset to PENDING when created or edited
        business.setVerificationStatus(VerificationStatus.PENDING);
        business.setVerifiedAt(null);
        business.setVerifiedBy(null);
        business.setVerificationNotes(null);

        Business saved = businessRepository.save(business);
        return BusinessProfileDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public CharityProfileDto getCharityProfile(String userEmail) {
        User user = getUserByEmail(userEmail);
        return charityRepository.findByUserId(user.getId())
                .map(CharityProfileDto::fromEntity)
                .orElse(null);
    }

    @Transactional
    public CharityProfileDto saveOrUpdateCharityProfile(String userEmail, CharityProfileDto dto) {
        User user = getUserByEmail(userEmail);
        if (user.getRole() != Role.CHARITY) {
            throw new BadRequestException("Only CHARITY accounts can manage charity profiles");
        }

        Optional<Charity> existing = charityRepository.findByUserId(user.getId());
        Charity charity;

        if (existing.isPresent()) {
            charity = existing.get();
            // Check registration number collision if changed
            if (!charity.getRegistrationNumber().equalsIgnoreCase(dto.getRegistrationNumber())) {
                charityRepository.findByRegistrationNumber(dto.getRegistrationNumber()).ifPresent(other -> {
                    if (!other.getId().equals(charity.getId())) {
                        throw new BadRequestException("Registration number is already in use by another charity");
                    }
                });
            }
        } else {
            if (charityRepository.existsByRegistrationNumber(dto.getRegistrationNumber())) {
                throw new BadRequestException("Registration number is already in use by another charity");
            }
            charity = new Charity();
            charity.setUser(user);
        }

        charity.setCharityName(dto.getCharityName());
        charity.setRegistrationNumber(dto.getRegistrationNumber());
        charity.setDescription(dto.getDescription());
        charity.setOperatingArea(dto.getOperatingArea());
        charity.setLogoUrl(dto.getLogoUrl());
        charity.setDocumentUrl(dto.getDocumentUrl());
        charity.setContactPerson(dto.getContactPerson());
        charity.setContactEmail(dto.getContactEmail() != null ? dto.getContactEmail() : user.getEmail());
        charity.setContactPhone(dto.getContactPhone() != null ? dto.getContactPhone() : user.getPhoneNumber());
        charity.setAddressLine1(dto.getAddressLine1());
        charity.setAddressLine2(dto.getAddressLine2());
        charity.setCity(dto.getCity());
        charity.setDistrict(dto.getDistrict());
        charity.setLatitude(dto.getLatitude());
        charity.setLongitude(dto.getLongitude());
        charity.setCapacityPeople(dto.getCapacityPeople());

        // Always reset to PENDING when created or edited
        charity.setVerificationStatus(VerificationStatus.PENDING);
        charity.setVerifiedAt(null);
        charity.setVerifiedBy(null);
        charity.setVerificationNotes(null);

        Charity saved = charityRepository.save(charity);
        return CharityProfileDto.fromEntity(saved);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}

