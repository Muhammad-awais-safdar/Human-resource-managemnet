package com.awais.hr.module.tenant.infrastructure.persistence;

import com.awais.hr.module.tenant.domain.model.TenantAggregate;
import com.awais.hr.module.tenant.domain.model.TenantDatabaseConfiguration;
import com.awais.hr.module.tenant.domain.model.TenantMetadata;
import com.awais.hr.module.tenant.domain.model.TenantStatus;
import com.awais.hr.module.tenant.domain.model.TenantType;
import com.awais.hr.module.tenant.domain.repository.TenantRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class TenantRepositoryImpl implements TenantRepository {

    private final TenantJpaRepository jpaRepository;

    public TenantRepositoryImpl(TenantJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<TenantAggregate> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<TenantAggregate> findBySubdomain(String subdomain) {
        return jpaRepository.findBySubdomain(subdomain).map(this::toDomain);
    }

    @Override
    public Optional<TenantAggregate> findByCustomDomain(String customDomain) {
        return jpaRepository.findByCustomDomain(customDomain).map(this::toDomain);
    }

    @Override
    public List<TenantAggregate> findAllActiveTenants() {
        return jpaRepository.findByStatus(TenantStatus.ACTIVE).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public TenantAggregate save(TenantAggregate tenant) {
        TenantEntity entity = toEntity(tenant);
        TenantEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    private TenantAggregate toDomain(TenantEntity entity) {
        TenantAggregate aggregate = TenantAggregate.builder()
                .name(entity.getName())
                .subdomain(entity.getSubdomain())
                .status(entity.getStatus())
                .type(entity.getType() != null ? entity.getType() : TenantType.SHARED_SCHEMA)
                .metadata(new TenantMetadata(
                        entity.getLogoUrl(),
                        entity.getPrimaryColor(),
                        entity.getSecondaryColor(),
                        entity.getCustomDomain()
                ))
                .databaseConfiguration(new TenantDatabaseConfiguration(
                        entity.getDbUrl(),
                        entity.getDbUsername(),
                        entity.getDbPassword(),
                        entity.getSubdomain()
                ))
                .build();
        aggregate.setId(entity.getId());
        aggregate.setCreatedAt(entity.getCreatedAt());
        aggregate.setUpdatedAt(entity.getUpdatedAt());
        return aggregate;
    }

    private TenantEntity toEntity(TenantAggregate domain) {
        TenantEntity entity = TenantEntity.builder()
                .name(domain.getName())
                .subdomain(domain.getSubdomain())
                .status(domain.getStatus())
                .type(domain.getType())
                .customDomain(domain.getMetadata() != null ? domain.getMetadata().customDomain() : null)
                .primaryColor(domain.getMetadata() != null ? domain.getMetadata().primaryColor() : null)
                .secondaryColor(domain.getMetadata() != null ? domain.getMetadata().secondaryColor() : null)
                .logoUrl(domain.getMetadata() != null ? domain.getMetadata().logoUrl() : null)
                .dbUrl(domain.getDatabaseConfiguration() != null ? domain.getDatabaseConfiguration().dbUrl() : null)
                .dbUsername(domain.getDatabaseConfiguration() != null ? domain.getDatabaseConfiguration().dbUsername() : null)
                .dbPassword(domain.getDatabaseConfiguration() != null ? domain.getDatabaseConfiguration().dbPassword() : null)
                .build();
        entity.setId(domain.getId());
        return entity;
    }
}
