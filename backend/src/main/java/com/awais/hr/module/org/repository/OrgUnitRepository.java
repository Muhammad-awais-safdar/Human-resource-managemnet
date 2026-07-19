package com.awais.hr.module.org.repository;

import com.awais.hr.module.org.model.OrgUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrgUnitRepository extends JpaRepository<OrgUnit, String> {
    List<OrgUnit> findByParentId(String parentId);
}
