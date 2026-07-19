package com.awais.hr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class AwaisHrApplication {

    public static void main(String[] args) {
        SpringApplication.run(AwaisHrApplication.class, args);
    }
}
