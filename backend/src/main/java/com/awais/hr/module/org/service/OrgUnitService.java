package com.awais.hr.module.org.service;

import com.awais.hr.module.org.model.OrgUnit;
import com.awais.hr.module.org.repository.OrgUnitRepository;
import lombok.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrgUnitService {

    private final OrgUnitRepository orgUnitRepository;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrgUnitNode {
        private String id;
        private String name;
        private String type;
        private String parentId;
        private String managerId;
        private String costCode;
        private List<OrgUnitNode> children;
    }

    public List<OrgUnit> findAll() {
        return orgUnitRepository.findAll();
    }

    public Optional<OrgUnit> findById(String id) {
        return orgUnitRepository.findById(id);
    }

    public OrgUnit save(OrgUnit unit) {
        if (unit.getId() == null) {
            unit.setId(UUID.randomUUID().toString());
        }

        // Validate circular dependencies
        if (unit.getParentId() != null && !unit.getParentId().trim().isEmpty()) {
            checkCircularDependency(unit.getId(), unit.getParentId().trim());
        }

        unit.setUpdatedAt(java.time.LocalDateTime.now());
        return orgUnitRepository.save(unit);
    }

    public void delete(String id) {
        // Clear parent links for children first
        List<OrgUnit> children = orgUnitRepository.findByParentId(id);
        for (OrgUnit child : children) {
            child.setParentId(null);
            orgUnitRepository.save(child);
        }
        orgUnitRepository.deleteById(id);
    }

    private void checkCircularDependency(String currentId, String parentId) {
        if (currentId.equals(parentId)) {
            throw new IllegalArgumentException("An organization unit cannot be its own parent.");
        }

        String nextParentId = parentId;
        Set<String> visited = new HashSet<>();
        visited.add(currentId);

        while (nextParentId != null && !nextParentId.trim().isEmpty()) {
            if (visited.contains(nextParentId)) {
                throw new IllegalArgumentException("Circular hierarchy loop detected: Node cannot be an ancestor of itself.");
            }
            visited.add(nextParentId);
            
            Optional<OrgUnit> parentOpt = orgUnitRepository.findById(nextParentId);
            if (parentOpt.isEmpty()) {
                break;
            }
            nextParentId = parentOpt.get().getParentId();
        }
    }

    public List<OrgUnitNode> getOrgChartTree() {
        List<OrgUnit> allUnits = orgUnitRepository.findAll();
        
        // Map elements to DTO nodes
        Map<String, OrgUnitNode> nodeMap = allUnits.stream().collect(Collectors.toMap(
                OrgUnit::getId,
                u -> OrgUnitNode.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .type(u.getType())
                        .parentId(u.getParentId())
                        .managerId(u.getManagerId())
                        .costCode(u.getCostCode())
                        .children(new ArrayList<>())
                        .build()
        ));

        List<OrgUnitNode> roots = new ArrayList<>();

        for (OrgUnit u : allUnits) {
            OrgUnitNode currentNode = nodeMap.get(u.getId());
            if (u.getParentId() == null || u.getParentId().trim().isEmpty() || !nodeMap.containsKey(u.getParentId())) {
                roots.add(currentNode);
            } else {
                OrgUnitNode parentNode = nodeMap.get(u.getParentId());
                parentNode.getChildren().add(currentNode);
            }
        }

        return roots;
    }
}
