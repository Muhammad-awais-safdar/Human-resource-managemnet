package com.awais.hr.module.org.controller;

import com.awais.hr.module.org.model.OrgUnit;
import com.awais.hr.module.org.service.OrgUnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/org")
@CrossOrigin(origins = "*")
@Tag(name = "Organization Structure & Hierarchy", description = "Endpoints for managing legal entities, departments, cost centers, and hierarchical org tree structure")
public class OrgUnitController {

    private final OrgUnitService orgUnitService;

    public OrgUnitController(OrgUnitService orgUnitService) {
        this.orgUnitService = orgUnitService;
    }

    @GetMapping("/tree")
    @Operation(summary = "Get Organization Hierarchy Tree", description = "Returns full recursive tree of organizational units for visualization in the Org Chart")
    public ResponseEntity<?> getOrgChartTree() {
        return ResponseEntity.ok(orgUnitService.getOrgChartTree());
    }

    @GetMapping
    @Operation(summary = "Get All Organization Units", description = "Lists flat list of all department, legal entity, cost center, and team units")
    public ResponseEntity<?> getAllUnits() {
        return ResponseEntity.ok(orgUnitService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Org Unit by ID", description = "Retrieves a single organizational unit details by its primary key UUID")
    public ResponseEntity<?> getUnitById(@PathVariable String id) {
        Optional<OrgUnit> unit = orgUnitService.findById(id);
        if (unit.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Org unit not found"));
        }
        return ResponseEntity.ok(unit.get());
    }

    @PostMapping
    @Operation(summary = "Create Org Unit Node", description = "Creates a new organizational unit (LEGAL_ENTITY, COST_CENTER, DEPARTMENT, or TEAM) with optional parent link")
    public ResponseEntity<?> createUnit(@RequestBody OrgUnit unit) {
        try {
            OrgUnit saved = orgUnitService.save(unit);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Org Unit", description = "Updates organizational unit attributes, name, cost code, manager, or parent link")
    public ResponseEntity<?> updateUnit(@PathVariable String id, @RequestBody OrgUnit unitDetails) {
        Optional<OrgUnit> unitOpt = orgUnitService.findById(id);
        if (unitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Org unit not found"));
        }

        OrgUnit unit = unitOpt.get();
        unit.setName(unitDetails.getName());
        unit.setType(unitDetails.getType());
        unit.setParentId(unitDetails.getParentId());
        unit.setManagerId(unitDetails.getManagerId());
        unit.setCostCode(unitDetails.getCostCode());

        try {
            OrgUnit updated = orgUnitService.save(unit);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Org Unit", description = "Deletes an organizational unit node and unlinks its direct children")
    public ResponseEntity<?> deleteUnit(@PathVariable String id) {
        Optional<OrgUnit> unitOpt = orgUnitService.findById(id);
        if (unitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Org unit not found"));
        }
        orgUnitService.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Org unit deleted successfully"));
    }
}
