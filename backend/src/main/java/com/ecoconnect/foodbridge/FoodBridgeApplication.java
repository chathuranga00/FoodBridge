package com.ecoconnect.foodbridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * FoodBridge REST API
 * Community sustainability platform for Sri Lanka (Team EcoConnect)
 */
@SpringBootApplication
@EnableScheduling
public class FoodBridgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodBridgeApplication.class, args);
    }
}

