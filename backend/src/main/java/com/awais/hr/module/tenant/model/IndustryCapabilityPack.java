package com.awais.hr.module.tenant.model;

import java.util.*;

public class IndustryCapabilityPack {

    public static final Map<String, List<String>> INDUSTRY_MODULE_MAP = new HashMap<>();

    static {
        // Base core modules common to all enterprise tenants
        List<String> coreModules = List.of("COREHR", "ATTENDANCE", "LEAVE", "PAYROLL", "PERFORMANCE", "RECRUITMENT");

        // 1. HEALTHCARE
        List<String> healthcare = new ArrayList<>(coreModules);
        healthcare.addAll(List.of("CLINICAL_LMS", "SHIFTS_24_7", "MEDICAL_LICENSES", "HIPAA_AUDIT"));
        INDUSTRY_MODULE_MAP.put("HEALTHCARE", healthcare);

        // 2. IT_SERVICES
        List<String> itServices = new ArrayList<>(coreModules);
        itServices.addAll(List.of("DEV_TIMESHEET", "EQUITY_VESTING", "OKRS_PERFORMANCE"));
        INDUSTRY_MODULE_MAP.put("IT_SERVICES", itServices);

        // 3. MANUFACTURING
        List<String> manufacturing = new ArrayList<>(coreModules);
        manufacturing.addAll(List.of("PIECE_RATE_FACTORY", "BIOMETRIC_SYNC", "OSHA_SAFETY"));
        INDUSTRY_MODULE_MAP.put("MANUFACTURING", manufacturing);

        // 4. HOSPITALITY
        List<String> hospitality = new ArrayList<>(coreModules);
        hospitality.addAll(List.of("RESTAURANT_TIPS", "HOTEL_ROSTERS", "FOOD_PERMITS"));
        INDUSTRY_MODULE_MAP.put("HOSPITALITY", hospitality);

        // 5. AGRICULTURE
        List<String> agriculture = new ArrayList<>(coreModules);
        agriculture.addAll(List.of("CROP_YIELD", "PIECE_RATE_FACTORY", "WEATHER_ALERTS"));
        INDUSTRY_MODULE_MAP.put("AGRICULTURE", agriculture);

        // 6. RETAIL
        List<String> retail = new ArrayList<>(coreModules);
        retail.addAll(List.of("RETAIL_POS", "SHIFT_MARKETPLACE", "COMMISSION_CALC"));
        INDUSTRY_MODULE_MAP.put("RETAIL", retail);

        // 7. EDUCATION
        List<String> education = new ArrayList<>(coreModules);
        education.addAll(List.of("PROFESSOR_TENURE", "ACADEMIC_CALENDAR"));
        INDUSTRY_MODULE_MAP.put("EDUCATION", education);

        // 8. CONSTRUCTION
        List<String> construction = new ArrayList<>(coreModules);
        construction.addAll(List.of("SITE_GEOFENCING", "SAFETY_PERMITS"));
        INDUSTRY_MODULE_MAP.put("CONSTRUCTION", construction);

        // 9. LOGISTICS
        List<String> logistics = new ArrayList<>(coreModules);
        logistics.addAll(List.of("FLEET_TRACKING", "DRIVER_DOT_LOGS"));
        INDUSTRY_MODULE_MAP.put("LOGISTICS", logistics);

        // 10. FINANCIAL_SERVICES
        List<String> finance = new ArrayList<>(coreModules);
        finance.addAll(List.of("INSURANCE_COMMISSION", "COMPLIANCE_AUDIT"));
        INDUSTRY_MODULE_MAP.put("FINANCIAL_SERVICES", finance);

        // 11. GENERAL
        INDUSTRY_MODULE_MAP.put("GENERAL", coreModules);
    }

    public static List<String> getEnabledModules(String industryType) {
        if (industryType == null || industryType.isBlank()) {
            return INDUSTRY_MODULE_MAP.get("GENERAL");
        }
        String key = industryType.toUpperCase().trim();
        return INDUSTRY_MODULE_MAP.getOrDefault(key, INDUSTRY_MODULE_MAP.get("GENERAL"));
    }
}
