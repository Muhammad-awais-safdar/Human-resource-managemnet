package com.awais.hr.module.auth.service;

public interface IpAccessControlService {
    boolean isIpAllowed(String clientIp);
}
