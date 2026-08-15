package com.awais.hr.config;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.exception.ModuleDisabledException;
import com.awais.hr.module.superadmin.service.ModuleManagementService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
public class ModuleAccessAspect {

    private static final Logger log = LoggerFactory.getLogger(ModuleAccessAspect.class);
    private final ModuleManagementService moduleManagementService;

    public ModuleAccessAspect(ModuleManagementService moduleManagementService) {
        this.moduleManagementService = moduleManagementService;
    }

    @Before("@annotation(com.awais.hr.config.RequiresModule) || @within(com.awais.hr.config.RequiresModule)")
    public void checkModuleAccess(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RequiresModule requiresModule = method.getAnnotation(RequiresModule.class);
        if (requiresModule == null) {
            requiresModule = method.getDeclaringClass().getAnnotation(RequiresModule.class);
        }

        if (requiresModule != null) {
            String moduleKey = requiresModule.value();
            String currentTenant = TenantContextHolder.getCurrentTenant();

            boolean enabled = moduleManagementService.isModuleEnabledForTenant(currentTenant, moduleKey);
            if (!enabled) {
                log.warn("[MODULE BLOCKED] Access to module '{}' denied for tenant '{}'", moduleKey, currentTenant);
                throw new ModuleDisabledException("Module '" + moduleKey + "' is currently disabled by the platform administrator.");
            }
        }
    }
}
