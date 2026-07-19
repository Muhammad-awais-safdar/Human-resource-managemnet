package com.awais.hr.module.attendance;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class AttendanceTest {

    // Islamabad HQ Coordinates: 33.6844, 73.0479
    private static final double OFFICE_LAT = 33.6844;
    private static final double OFFICE_LON = 73.0479;
    private static final double MAX_DISTANCE_DELTA = 0.05; // ~5km bounding box delta

    private boolean isPunchInLocationValid(double lat, double lon) {
        double latDiff = Math.abs(lat - OFFICE_LAT);
        double lonDiff = Math.abs(lon - OFFICE_LON);
        return latDiff <= MAX_DISTANCE_DELTA && lonDiff <= MAX_DISTANCE_DELTA;
    }

    @Test
    public void isPunchInLocationValid_shouldAcceptInsideHQBounds() {
        assertTrue(isPunchInLocationValid(33.6850, 73.0480));
        assertTrue(isPunchInLocationValid(33.6900, 73.0500));
    }

    @Test
    public void isPunchInLocationValid_shouldRejectOutsideBounds() {
        assertFalse(isPunchInLocationValid(34.0000, 72.0000)); // Far away
        assertFalse(isPunchInLocationValid(40.7128, -74.0060)); // New York
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

    @Test
    public void calculateHaversineDistance_shouldBeAccurate() {
        // Islamabad Corporate HQ (33.6844, 73.0479) to nearby point
        double distanceHQ = calculateHaversineDistance(33.6844, 73.0479, 33.6890, 73.0520);
        // Distance should be around 0.6-0.7 km
        assertTrue(distanceHQ > 0.1 && distanceHQ < 1.0);
        
        // Distance to New York (40.7128, -74.0060) should be thousands of km
        double distanceNY = calculateHaversineDistance(33.6844, 73.0479, 40.7128, -74.0060);
        assertTrue(distanceNY > 10000.0);
    }
}
