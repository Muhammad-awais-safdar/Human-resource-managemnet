package com.awais.hr.module.ticket.controller;

import com.awais.hr.common.ApiResponse;
import com.awais.hr.module.ticket.dto.SupportTicketRequestDTO;
import com.awais.hr.module.ticket.service.TicketService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/suite/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ("anonymousUser".equals(principal) || !(principal instanceof String)) {
            throw new SecurityException("Unauthorized access.");
        }
        return (String) principal;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getTickets() {
        try {
            List<Map<String, Object>> result = ticketService.getTickets(getAuthenticatedUserEmail());
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> submitTicket(@RequestBody SupportTicketRequestDTO dto) {
        try {
            ticketService.submitTicket(getAuthenticatedUserEmail(), dto);
            return ApiResponse.success(Map.of("success", true, "message", "Support ticket opened successfully."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Object>> deleteTicket(@PathVariable String id) {
        try {
            ticketService.deleteTicket(id);
            return ApiResponse.success(Map.of("success", true, "message", "Support ticket soft deleted."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{id}/assign")
    public ApiResponse<Map<String, Object>> assignTicket(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String assigneeId = body.get("assigneeId");
            ticketService.assignTicket(id, assigneeId);
            return ApiResponse.success(Map.of("success", true, "message", "Ticket assigned."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{id}/resolve")
    public ApiResponse<Map<String, Object>> resolveTicket(@PathVariable String id) {
        try {
            ticketService.resolveTicket(id);
            return ApiResponse.success(Map.of("success", true, "message", "Ticket marked as resolved."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/kb/search")
    public ApiResponse<List<Map<String, Object>>> searchKnowledgeBase(@RequestParam String q) {
        try {
            List<Map<String, Object>> result = ticketService.searchKnowledgeBase(q);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/kb")
    public ApiResponse<Map<String, Object>> createKnowledgeBaseArticle(@RequestBody Map<String, String> body) {
        try {
            String title = body.get("title");
            String content = body.get("content");
            String category = body.get("category");
            ticketService.createKnowledgeBaseArticle(title, content, category);
            return ApiResponse.success(Map.of("success", true, "message", "KB article created."));
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
