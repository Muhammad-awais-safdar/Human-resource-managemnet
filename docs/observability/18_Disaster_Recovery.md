# 18 - Disaster Recovery & Backup Strategy

## Data Persistence Backup
Monitoring volumes (`prometheus_data`, `grafana_data`, `loki_data`, `tempo_data`) can be backed up using volume snapshots:
```bash
docker run --rm -v prometheus_data:/volume -v $(pwd)/backups:/backup alpine tar -czf /backup/prometheus_backup.tar.gz -C /volume .
```

## Restore Procedure
```bash
docker run --rm -v prometheus_data:/volume -v $(pwd)/backups:/backup alpine tar -xzf /backup/prometheus_backup.tar.gz -C /volume
```
