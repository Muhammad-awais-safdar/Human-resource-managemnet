package com.awais.hr.module.attendance.service;

public interface GeofenceService {
    boolean isInsideGeofence(double latitude, double longitude);
}
