package com.awais.hr.module.attendance.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class GeofenceServiceImpl implements GeofenceService {

    private final DataSource dataSource;

    public GeofenceServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0; // Earth's radius in kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }

    @Override
    public boolean isInsideGeofence(double latitude, double longitude) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        try {
            List<Map<String, Object>> activeGeofences = jdbcTemplate.queryForList(
                    "SELECT latitude, longitude, radius_km FROM geofence_setting WHERE active = TRUE"
            );
            if (activeGeofences.isEmpty()) {
                // System warning, allow access fallback if no geofence configured at all
                return true;
            }

            for (Map<String, Object> geo : activeGeofences) {
                double officeLat = ((Number) geo.get("latitude")).doubleValue();
                double officeLon = ((Number) geo.get("longitude")).doubleValue();
                double allowedRadiusKm = ((Number) geo.get("radius_km")).doubleValue();

                double distanceKm = calculateHaversineDistance(latitude, longitude, officeLat, officeLon);
                if (distanceKm <= allowedRadiusKm) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            System.err.println("Warning: geofence verification error - " + e.getMessage());
            return true; // Fallback to not disrupt operations
        }
    }
}
