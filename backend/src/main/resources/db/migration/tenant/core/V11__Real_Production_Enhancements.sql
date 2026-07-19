-- V11: Real-Time Production Enhancements (Dynamic IP check, geofencing coordinates, and parsed CV metadata)

-- 1. IP restriction rules table (Phase 4 Auth IP restrictions)
CREATE TABLE IF NOT EXISTS ip_restriction (
    id VARCHAR(50) PRIMARY KEY,
    ip_address VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'DENY' NOT NULL, -- 'ALLOW' (whitelist) or 'DENY' (blacklist)
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed a blocked IP as a sample (to keep it clean we don't block actual localhosts unless desired)
INSERT INTO ip_restriction (id, ip_address, type, description)
SELECT 'ip-restrict-sample-1', '192.168.1.99', 'DENY', 'Blacklisted corporate scanner IP'
WHERE NOT EXISTS (SELECT 1 FROM ip_restriction WHERE ip_address = '192.168.1.99');

-- 2. Dynamic geofence configurations (Phase 13 Geofenced Attendance)
CREATE TABLE IF NOT EXISTS geofence_setting (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL, -- e.g. 5.0 km
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed a default corporate main office geofence location
INSERT INTO geofence_setting (id, name, latitude, longitude, radius_km, active)
SELECT 'geo-setting-main-office', 'Islamabad Corporate HQ', 33.6844, 73.0479, 5.0, TRUE
WHERE NOT EXISTS (SELECT 1 FROM geofence_setting WHERE id = 'geo-setting-main-office');

-- 3. Extend ATS candidate application table for metadata persistence (Phase 10 ATS CV Parser)
ALTER TABLE candidate_application ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE candidate_application ADD COLUMN IF NOT EXISTS extracted_skills TEXT;
ALTER TABLE candidate_application ADD COLUMN IF NOT EXISTS extracted_experience VARCHAR(100);
