package com.athlon.marketplaceservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MarketplaceserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MarketplaceserviceApplication.class, args);
	}

}
