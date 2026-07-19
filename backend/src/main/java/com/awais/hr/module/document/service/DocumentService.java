package com.awais.hr.module.document.service;

import com.awais.hr.module.document.dto.DocumentUploadRequestDTO;
import java.util.List;
import java.util.Map;

public interface DocumentService {
    List<Map<String, Object>> getDocuments(String email);
    void uploadDocument(String email, DocumentUploadRequestDTO dto);
    void signDocument(String documentId, String signatureData);
    List<Map<String, Object>> getExpiredDocuments();
}
