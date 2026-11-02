package com.ecoconnect.foodbridge.config;

import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds a default ADMIN account on application startup if none exists,
 * configured via environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE).
 */
@Component
public class AdminDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@foodbridge.lk}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@FoodBridge2026}")
    private String adminPassword;

    @Value("${app.admin.name:FoodBridge Administrator}")
    private String adminName;

    @Value("${app.admin.phone:+94112345678}")
    private String adminPhone;

    public AdminDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String normalizedEmail = adminEmail.toLowerCase().trim();

        if (userRepository.findByEmail(normalizedEmail).isEmpty()) {
            User admin = User.builder()
                    .email(normalizedEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .fullName(adminName)
                    .phoneNumber(adminPhone)
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();

            userRepository.save(admin);
            logger.info("Successfully seeded default ADMIN account: [{}]", normalizedEmail);
        } else {
            logger.info("Default ADMIN account already exists: [{}]", normalizedEmail);
        }
    }
}

