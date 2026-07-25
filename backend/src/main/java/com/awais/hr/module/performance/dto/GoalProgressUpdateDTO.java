package com.awais.hr.module.performance.dto;

import lombok.Data;

@Data
public class GoalProgressUpdateDTO {
    private Integer progress;
    private Integer currentValue;

    public int getEffectiveProgress() {
        if (progress != null) return progress;
        if (currentValue != null) return currentValue;
        return 0;
    }
}
