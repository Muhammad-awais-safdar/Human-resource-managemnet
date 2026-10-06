package com.awais.hr.module.project;

import com.awais.hr.module.project.dto.TaskRequestDTO;
import com.awais.hr.module.project.service.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

class TaskManagementTest {

    @Mock
    private DataSource dataSource;

    private TaskServiceImpl taskService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        taskService = new TaskServiceImpl(dataSource);
    }

    @Test
    @DisplayName("Task Management: Task creation with blank title throws IllegalArgumentException")
    void testCreateTask_blankTitle_throwsException() {
        TaskRequestDTO dto = new TaskRequestDTO();
        dto.setTitle("  ");

        assertThrows(IllegalArgumentException.class, () -> {
            taskService.createTask("user@ep-systems.com", dto);
        });
    }

    @Test
    @DisplayName("Task Management: Invalid task state transition throws IllegalArgumentException")
    void testTransitionTaskStatus_invalidState_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            taskService.transitionTaskStatus("task-101", "SUPER_FINISHED", "Done!", "user@ep-systems.com");
        });
    }
}
