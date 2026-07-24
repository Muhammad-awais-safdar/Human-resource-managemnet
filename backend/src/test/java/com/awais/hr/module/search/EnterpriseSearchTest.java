package com.awais.hr.module.search;

import com.awais.hr.module.search.service.EnterpriseSearchService;
import com.awais.hr.module.search.service.EnterpriseSearchServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class EnterpriseSearchTest {

    @Mock
    private DataSource dataSource;

    private EnterpriseSearchService searchService;

    @BeforeEach
    public void setUp() {
        searchService = new EnterpriseSearchServiceImpl(dataSource);
    }

    @Test
    public void indexEntity_shouldThrowException_whenEntityTypeOrTitleIsBlank() {
        Map<String, Object> body = Map.of("entityType", " ", "title", "Title");
        assertThrows(IllegalArgumentException.class, () -> searchService.indexEntity(body));
    }
}
