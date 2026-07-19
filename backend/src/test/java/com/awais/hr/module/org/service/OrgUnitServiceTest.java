package com.awais.hr.module.org.service;

import com.awais.hr.module.org.model.OrgUnit;
import com.awais.hr.module.org.repository.OrgUnitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class OrgUnitServiceTest {

    @Mock
    private OrgUnitRepository orgUnitRepository;

    @InjectMocks
    private OrgUnitService orgUnitService;

    @Test
    public void save_shouldThrowException_whenCircularDependencyDetected() {
        // Mock hierarchy: A -> B -> C -> A
        OrgUnit unitA = OrgUnit.builder().id("A").parentId("B").build();
        OrgUnit unitB = OrgUnit.builder().id("B").parentId("C").build();
        OrgUnit unitC = OrgUnit.builder().id("C").parentId("A").build();

        // When checking cycle on C with parent A
        when(orgUnitRepository.findById("A")).thenReturn(Optional.of(unitA));
        when(orgUnitRepository.findById("B")).thenReturn(Optional.of(unitB));

        assertThrows(IllegalArgumentException.class, () -> {
            orgUnitService.save(unitC);
        });
    }

    @Test
    public void save_shouldThrowException_whenSelfParentAssignmentOccurs() {
        OrgUnit unitSelf = OrgUnit.builder().id("A").parentId("A").build();

        assertThrows(IllegalArgumentException.class, () -> {
            orgUnitService.save(unitSelf);
        });
    }
}
