package com.awais.hr.module.ticket.dto;

import lombok.Data;

@Data
public class SupportTicketRequestDTO {
    private String subject;
    private String description;
    private String priority;
}
