package com.awais.hr.module.auditcenter;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {

    /**
     * Action type identifier (e.g. LOGIN, SALARY_CHANGE, PAYROLL_RUN, ROLE_ASSIGNMENT, EXPORT)
     */
    String action();

    /**
     * Target entity name (e.g. Employee, PayrollBatch, Role, LeaveRequest)
     */
    String entity() default "SystemEntity";
}
