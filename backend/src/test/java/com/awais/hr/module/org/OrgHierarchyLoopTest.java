package com.awais.hr.module.org;

import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class OrgHierarchyLoopTest {

    private boolean detectLoop(String currentId, String parentId, Map<String, String> adjacencyList) {
        if (parentId == null) return false;
        String nextParent = adjacencyList.get(parentId);
        while (nextParent != null) {
            if (nextParent.equals(currentId)) {
                return true;
            }
            nextParent = adjacencyList.get(nextParent);
        }
        return false;
    }

    @Test
    public void detectLoop_shouldReturnTrue_whenLoopExists() {
        Map<String, String> graph = new HashMap<>();
        graph.put("nodeA", "nodeB");
        graph.put("nodeB", "nodeC");
        graph.put("nodeC", "nodeA");

        assertTrue(detectLoop("nodeA", "nodeC", graph));
    }

    @Test
    public void detectLoop_shouldReturnFalse_whenNoLoop() {
        Map<String, String> graph = new HashMap<>();
        graph.put("nodeA", "nodeB");
        graph.put("nodeB", "nodeC");
        graph.put("nodeC", null);

        assertFalse(detectLoop("nodeA", "nodeC", graph));
    }
}
