package com.awais.hr.module.ticket.service;

import com.awais.hr.module.ticket.dto.SupportTicketRequestDTO;
import java.util.List;
import java.util.Map;

public interface TicketService {
    List<Map<String, Object>> getTickets(String email);
    void submitTicket(String email, SupportTicketRequestDTO dto);
    void deleteTicket(String id);
    void assignTicket(String ticketId, String assigneeId);
    void resolveTicket(String ticketId);
    List<Map<String, Object>> searchKnowledgeBase(String query);
    void createKnowledgeBaseArticle(String title, String content, String category);
}
