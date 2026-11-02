package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.Charity;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.CharityRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service to enforce platform Rule 2:
 * "Businesses and charities must be admin-VERIFIED before they can publish."
 */
@Service
public class VerificationGuardService {

    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;

    public VerificationGuardService(BusinessRepository businessRepository,
                                    CharityRepository charityRepository) {
        this.businessRepository = businessRepository;
        this.charityRepository = charityRepository;
    }

    /**
     * Enforces Rule 2 for business accounts (RESTAURANT and GROCERY).
     */
    public Business assertBusinessVerifiedForPublishing(User user) {
        if (user.getRole() != Role.RESTAURANT && user.getRole() != Role.GROCERY) {
            throw new BadRequestException("User does not have a business role (RESTAURANT or GROCERY)");
        }

        Optional<Business> businessOpt = businessRepository.findByUserId(user.getId());
        if (businessOpt.isEmpty()) {
            throw new BadRequestException("You must complete and submit your business profile before publishing (Rule 2).");
        }

        Business business = businessOpt.get();
        if (business.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException(
                "Rule 2 violation: Business account must be admin-VERIFIED before publishing listings. Current status: " +
                business.getVerificationStatus() +
                (business.getVerificationNotes() != null ? " (" + business.getVerificationNotes() + ")" : "")
            );
        }

        return business;
    }

    /**
     * Enforces Rule 2 for charity accounts.
     */
    public Charity assertCharityVerifiedForPublishing(User user) {
        if (user.getRole() != Role.CHARITY) {
            throw new BadRequestException("User does not have a CHARITY role");
        }

        Optional<Charity> charityOpt = charityRepository.findByUserId(user.getId());
        if (charityOpt.isEmpty()) {
            throw new BadRequestException("You must complete and submit your charity profile before publishing (Rule 2).");
        }

        Charity charity = charityOpt.get();
        if (charity.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException(
                "Rule 2 violation: Charity account must be admin-VERIFIED before publishing campaigns or requests. Current status: " +
                charity.getVerificationStatus() +
                (charity.getVerificationNotes() != null ? " (" + charity.getVerificationNotes() + ")" : "")
            );
        }

        return charity;
    }
}
