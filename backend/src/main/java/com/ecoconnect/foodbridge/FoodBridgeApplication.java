package com.ecoconnect.foodbridge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;

/**
 * FoodBridge REST API
 * Community sustainability platform for Sri Lanka (Team EcoConnect)
 */
@SpringBootApplication
@EnableScheduling
public class FoodBridgeApplication {

    private static final Logger log = LoggerFactory.getLogger(FoodBridgeApplication.class);

    public static void main(String[] args) {
        initEnvironment();
        SpringApplication.run(FoodBridgeApplication.class, args);
    }

    /**
     * Initializes environment variables and verifies database connectivity.
     * If a remote database is unreachable (e.g., due to local ISP IPv6 routing or offline dev),
     * it automatically falls back to the local in-memory profile so the backend boots immediately.
     */
    public static void initEnvironment() {
        loadDotEnv();

        String dbUrl = System.getProperty("DB_URL");
        if (dbUrl == null) {
            dbUrl = System.getenv("DB_URL");
        }

        if (dbUrl != null && dbUrl.startsWith("jdbc:postgresql://")) {
            String dbUser = System.getProperty("DB_USERNAME", System.getenv().getOrDefault("DB_USERNAME", "postgres"));
            String dbPass = System.getProperty("DB_PASSWORD", System.getenv().getOrDefault("DB_PASSWORD", ""));

            log.info("Checking database connectivity to: {}", dbUrl);
            boolean connected = false;
            try {
                DriverManager.setLoginTimeout(3);
                try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass)) {
                    connected = true;
                    log.info("Database connection verified! Running with live PostgreSQL database.");
                }
            } catch (Exception e) {
                log.warn("Remote database unreachable ({}: {}).", dbUrl, e.getMessage());
            }

            if (!connected) {
                log.info("Falling back to local in-memory database with pre-seeded demo data so backend starts without hanging.");
                System.clearProperty("DB_URL");
                System.setProperty("DB_URL", "jdbc:h2:mem:foodbridge_dev;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL");
                System.setProperty("spring.datasource.url", "jdbc:h2:mem:foodbridge_dev;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL");
                System.setProperty("spring.datasource.driver-class-name", "org.h2.Driver");
                System.setProperty("spring.datasource.username", "sa");
                System.setProperty("spring.datasource.password", "");
                System.setProperty("spring.jpa.hibernate.ddl-auto", "update");
                System.setProperty("spring.profiles.active", "local");
                System.setProperty("foodbridge.seed-demo-data", "true");
            }
        }
    }

    /**
     * Automatically loads .env file if present in current directory, backend/, or parent directory,
     * setting values as system properties so Spring Boot datasource and services pick them up.
     */
    public static void loadDotEnv() {
        File[] candidates = new File[] {
                new File(".env"),
                new File("backend/.env"),
                new File("../backend/.env"),
                new File("../.env")
        };

        for (File file : candidates) {
            if (file.exists() && file.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
                    String line;
                    int loadedCount = 0;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                                loadedCount++;
                            }
                        }
                    }
                    log.info("Loaded {} environment properties from: {}", loadedCount, file.getAbsolutePath());
                    break;
                } catch (IOException e) {
                    log.warn("Warning: Unable to read .env file from {}: {}", file.getAbsolutePath(), e.getMessage());
                }
            }
        }
    }
}
