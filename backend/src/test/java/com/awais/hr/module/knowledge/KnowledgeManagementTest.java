package com.awais.hr.module.knowledge;

import com.awais.hr.module.knowledge.service.KnowledgeManagementService;
import com.awais.hr.module.knowledge.service.KnowledgeManagementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class KnowledgeManagementTest {

    @Mock
    private DataSource dataSource;

    private KnowledgeManagementService knowledgeService;

    @BeforeEach
    public void setUp() {
        knowledgeService = new KnowledgeManagementServiceImpl(dataSource);
    }

    @Test
    public void createArticle_shouldThrowException_whenTitleOrContentIsBlank() {
        Map<String, Object> body = Map.of("title", " ", "content", "valid content");
        assertThrows(IllegalArgumentException.class, () -> knowledgeService.createArticle(body));
    }

    @Test
    public void createSop_shouldThrowException_whenSopTitleIsBlank() {
        Map<String, Object> body = Map.of("sopTitle", "");
        assertThrows(IllegalArgumentException.class, () -> knowledgeService.createSop(body));
    }
}
