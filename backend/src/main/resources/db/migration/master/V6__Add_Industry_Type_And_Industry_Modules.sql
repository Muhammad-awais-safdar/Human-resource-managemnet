-- Master Schema Migration V6: Add Industry Type to Tenant and Seed Industry Module Catalog

-- 1. Add industry_type column to tenant table
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS industry_type VARCHAR(50) DEFAULT 'IT_TECH';

-- 2. Seed All Industry Capability Modules into platform_module catalog
INSERT INTO platform_module (module_key, name, category, description, is_globally_enabled) VALUES
('HEALTHCARE_CREDENTIALS', 'Medical License & Credentials', 'HEALTHCARE', 'Medical & nursing license tracking, renewals, and board verification', true),
('RESTAURANT_TIPS', 'Restaurant Tip Splitter & Pools', 'HOSPITALITY', 'Automated POS tip pool calculation and staff distribution engine', true),
('PIECE_RATE_FACTORY', 'Piece-Rate Factory Payroll', 'MANUFACTURING', 'Output-based piece-rate wage calculation engine for factory workers', true),
('WEATHER_DELAY', 'Weather Delay Site Auto-Pause', 'CONSTRUCTION', 'OpenWeatherMap API real-time weather delay attendance trigger', true),
('DEV_TIMESHEET', 'Developer Git & Jira Sync', 'IT_TECH', 'Git commit & Jira worklog billable timesheet ingestion service', true),
('EQUITY_VESTING', 'Stock Option & Equity Vesting', 'IT_TECH', 'Employee stock option grant tracking & equity portal', true),
('DRIVER_DOT', 'Driver Driving Hours Validator', 'LOGISTICS', 'DOT / EU rest-period legal driving hour limits & compliance validator', true),
('TELEMATICS_GPS', 'Fleet Telematics GPS Sync', 'LOGISTICS', 'Samsara / Geotab API automated fleet mileage & engine runtime sync', true),
('BANK_ISO20022', 'ISO 20022 XML Bank Gateway', 'FINANCE', 'Direct bank disbursement ISO 20022 XML (pain.001) generator', true),
('MAKER_CHECKER', 'Maker-Checker Dual Approval', 'GOVERNANCE', 'Enforce dual-authorization for salary revisions & high-value expenses', true),
('OFFSHORE_RIGS', 'Offshore Rig Rotational Roster', 'OIL_GAS', 'Offshore rig & remote camp rotational rosters (2w on / 2w off)', true),
('MINE_SAFETY', 'Mine Cap-Lamp & Gear Checkout', 'MINING', 'Underground mine safety gear & cap-lamp checkout verification log', true),
('DOD_CLEARANCE', 'DoD Security Clearance Tracker', 'DEFENSE', 'Secret & Top Secret security clearance expiration & renewal tracker', true),
('CIVIL_SERVICE', 'Civil Service Step Calculator', 'PUBLIC_SECTOR', 'Government civil service pay grade scale step-increment auto-calculator', true),
('DONOR_GRANTS', 'NGO Donor Grant Time Splitter', 'NONPROFIT', 'USAID & UN compliant donor grant workforce salary cost allocation', true),
('CROP_YIELD', 'Crop Yield Harvest Payroll', 'AGRICULTURE', 'Seasonal harvest crop yield piece-rate pay calculator (per kg/box)', true)
ON CONFLICT (module_key) DO NOTHING;
