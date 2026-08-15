package com.awais.hr.module.tenant.model;

import java.util.List;
import java.util.Set;

/**
 * Defines the 25 Global Industry Capability Packs and their default module entitlement presets.
 */
public enum IndustryCapabilityPack {

    IT_TECH(
        "IT, Technology & Software Services",
        "💻",
        List.of("RECRUITMENT", "PAYROLL", "ATTENDANCE", "EXPENSE", "ASSET", "PERFORMANCE", "LEARNING", "TICKET", "SUCCESSION", "AICOPILOT", "DEV_TIMESHEET", "EQUITY_VESTING"),
        List.of("PIECE_RATE_FACTORY", "HEALTHCARE_CREDENTIALS", "RESTAURANT_TIPS", "OFFSHORE_RIGS", "MINE_SAFETY", "DRIVER_DOT")
    ),

    MANUFACTURING(
        "Manufacturing, Heavy Industry & Automotive",
        "🏭",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "LEARNING", "TICKET", "PIECE_RATE_FACTORY"),
        List.of("RESTAURANT_TIPS", "DEV_TIMESHEET", "EQUITY_VESTING", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS")
    ),

    RETAIL(
        "Retail, Supermarkets & E-Commerce",
        "🛍️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "EXPENSE", "LEARNING", "TICKET"),
        List.of("PIECE_RATE_FACTORY", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS", "DEV_TIMESHEET")
    ),

    HEALTHCARE(
        "Healthcare, Hospitals & Pharmaceuticals",
        "🏥",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "LEARNING", "TICKET", "HEALTHCARE_CREDENTIALS"),
        List.of("RESTAURANT_TIPS", "PIECE_RATE_FACTORY", "OFFSHORE_RIGS", "DEV_TIMESHEET", "DRIVER_DOT")
    ),

    BFSI(
        "Banking, Financial Services & Insurance",
        "🏦",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "EXPENSE", "PERFORMANCE", "SUCCESSION", "BANK_ISO20022", "MAKER_CHECKER"),
        List.of("PIECE_RATE_FACTORY", "RESTAURANT_TIPS", "WEATHER_DELAY", "OFFSHORE_RIGS")
    ),

    HOSPITALITY(
        "Hospitality, Hotels & Restaurants (HoReCa)",
        "🏨",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "LEARNING", "RESTAURANT_TIPS"),
        List.of("HEALTHCARE_CREDENTIALS", "PIECE_RATE_FACTORY", "OFFSHORE_RIGS", "DEV_TIMESHEET")
    ),

    CONSTRUCTION(
        "Construction, Real Estate & Field Services",
        "🏗️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "EXPENSE", "WEATHER_DELAY"),
        List.of("RESTAURANT_TIPS", "HEALTHCARE_CREDENTIALS", "DEV_TIMESHEET", "EQUITY_VESTING")
    ),

    LOGISTICS(
        "Logistics, Supply Chain & Fleet Transport",
        "🚚",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "EXPENSE", "ASSET", "DRIVER_DOT", "TELEMATICS_GPS"),
        List.of("RESTAURANT_TIPS", "HEALTHCARE_CREDENTIALS", "PIECE_RATE_FACTORY", "EQUITY_VESTING")
    ),

    EDUCATION(
        "Education, Universities & School Networks",
        "🎓",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "LEARNING", "PERFORMANCE", "TICKET"),
        List.of("PIECE_RATE_FACTORY", "RESTAURANT_TIPS", "OFFSHORE_RIGS", "DRIVER_DOT")
    ),

    CONSULTING(
        "Professional Services, Law Firms & Consulting",
        "💼",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "EXPENSE", "PERFORMANCE", "SUCCESSION"),
        List.of("PIECE_RATE_FACTORY", "HEALTHCARE_CREDENTIALS", "WEATHER_DELAY", "OFFSHORE_RIGS")
    ),

    INSURANCE(
        "Insurance & Actuarial Services",
        "🛡️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "EXPENSE", "PERFORMANCE", "MAKER_CHECKER"),
        List.of("PIECE_RATE_FACTORY", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS")
    ),

    LIFE_SCIENCES(
        "Life Sciences & Biotech",
        "💊",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "LEARNING", "HEALTHCARE_CREDENTIALS"),
        List.of("RESTAURANT_TIPS", "PIECE_RATE_FACTORY", "WEATHER_DELAY")
    ),

    TELECOM(
        "Telecommunications",
        "📡",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "EXPENSE", "TICKET"),
        List.of("RESTAURANT_TIPS", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS")
    ),

    MEDIA(
        "Media, Entertainment & Creative",
        "🎬",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "RECRUITMENT"),
        List.of("PIECE_RATE_FACTORY", "HEALTHCARE_CREDENTIALS", "MAKER_CHECKER")
    ),

    ENERGY(
        "Energy & Public Utilities",
        "⚡",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "TICKET"),
        List.of("RESTAURANT_TIPS", "DEV_TIMESHEET", "EQUITY_VESTING")
    ),

    OIL_GAS(
        "Oil, Gas & Petrochemicals",
        "🛢️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "EXPENSE", "OFFSHORE_RIGS"),
        List.of("RESTAURANT_TIPS", "DEV_TIMESHEET", "EQUITY_VESTING")
    ),

    MINING(
        "Mining & Raw Extraction",
        "⛏️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "MINE_SAFETY"),
        List.of("RESTAURANT_TIPS", "DEV_TIMESHEET", "HEALTHCARE_CREDENTIALS")
    ),

    AUTOMOTIVE(
        "Automotive Manufacturing",
        "🚗",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "PIECE_RATE_FACTORY"),
        List.of("RESTAURANT_TIPS", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS")
    ),

    AEROSPACE(
        "Aerospace & Defense",
        "✈️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "DOD_CLEARANCE"),
        List.of("RESTAURANT_TIPS", "DEV_TIMESHEET", "CROP_YIELD")
    ),

    PUBLIC_SECTOR(
        "Government & Public Administration",
        "🏛️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "CIVIL_SERVICE"),
        List.of("RESTAURANT_TIPS", "DEV_TIMESHEET", "EQUITY_VESTING")
    ),

    NONPROFIT(
        "NGO, Non-Profit & International Development",
        "🤝",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "EXPENSE", "DONOR_GRANTS"),
        List.of("PIECE_RATE_FACTORY", "RESTAURANT_TIPS", "OFFSHORE_RIGS")
    ),

    AGRICULTURE(
        "Agriculture & Agribusiness",
        "🌾",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "CROP_YIELD"),
        List.of("RESTAURANT_TIPS", "DEV_TIMESHEET", "HEALTHCARE_CREDENTIALS")
    ),

    WHOLESALE(
        "Wholesale & Bulk Distribution",
        "📦",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "DRIVER_DOT"),
        List.of("RESTAURANT_TIPS", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS")
    ),

    SPORTS_EVENTS(
        "Sports, Venues & Entertainment",
        "🏟️",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET"),
        List.of("PIECE_RATE_FACTORY", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS")
    ),

    REAL_ESTATE(
        "Real Estate & Property Management",
        "🏢",
        List.of("CORE", "ATTENDANCE", "PAYROLL", "ASSET", "EXPENSE"),
        List.of("PIECE_RATE_FACTORY", "HEALTHCARE_CREDENTIALS", "OFFSHORE_RIGS")
    );

    private final String displayName;
    private final String icon;
    private final List<String> enabledModules;
    private final List<String> disabledModules;

    IndustryCapabilityPack(String displayName, String icon, List<String> enabledModules, List<String> disabledModules) {
        this.displayName = displayName;
        this.icon = icon;
        this.enabledModules = enabledModules;
        this.disabledModules = disabledModules;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIcon() {
        return icon;
    }

    public List<String> getEnabledModules() {
        return enabledModules;
    }

    public List<String> getDisabledModules() {
        return disabledModules;
    }

    public static IndustryCapabilityPack fromString(String text) {
        if (text == null || text.isBlank()) return IT_TECH;
        for (IndustryCapabilityPack pack : IndustryCapabilityPack.values()) {
            if (pack.name().equalsIgnoreCase(text) || pack.getDisplayName().equalsIgnoreCase(text)) {
                return pack;
            }
        }
        return IT_TECH;
    }
}
