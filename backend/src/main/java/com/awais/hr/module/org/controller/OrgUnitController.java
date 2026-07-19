package com.awais.hr.module.org.controller;

import com.awais.hr.module.org.model.OrgUnit;
import com.awais.hr.module.org.service.OrgUnitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/org")
@CrossOrigin(origins = "*")
public class OrgUnitController {

    private final OrgUnitService orgUnitService;

    public OrgUnitController(OrgUnitService orgUnitService) {
        this.orgUnitService = orgUnitService;
    }

    @GetMapping("/tree")
    public ResponseEntity<?> getOrgChartTree() {
        return ResponseEntity.ok(orgUnitService.getOrgChartTree());
    }

    @GetMapping
    public ResponseEntity<?> getAllUnits() {
        return ResponseEntity.ok(orgUnitService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUnitById(@PathVariable String id) {
        Optional<OrgUnit> unit = orgUnitService.findById(id);
        if (unit.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Org unit not found"));
        }
        return ResponseEntity.ok(unit.get());
    }

    @PostMapping
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
