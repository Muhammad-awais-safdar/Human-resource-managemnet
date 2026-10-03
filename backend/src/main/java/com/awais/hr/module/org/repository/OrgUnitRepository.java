package com.awais.hr.module.org.repository;

import com.awais.hr.module.org.dto.OrgUnitProjection;
import com.awais.hr.module.org.model.OrgUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrgUnitRepository extends JpaRepository<OrgUnit, String> {
    List<OrgUnit> findByParentId(String parentId);

    /**
     * Optimized DB Query: Selects ONLY required OrgUnit columns into Java 21 Record.
     */
    @Query("SELECT new com.awais.hr.module.org.dto.OrgUnitProjection(o.id, o.name, o.type, o.parentId, o.costCode, o.createdAt) FROM OrgUnit o WHERE o.parentId = :parentId")
    List<OrgUnitProjection> findProjectionsByParentId(@Param("parentId") String parentId);

    /**
     * Optimized DB Query: Selects all OrgUnits with specific required columns only.
     */
    @Query("SELECT new com.awais.hr.module.org.dto.OrgUnitProjection(o.id, o.name, o.type, o.parentId, o.costCode, o.createdAt) FROM OrgUnit o")
    List<OrgUnitProjection> findAllProjections();
}
