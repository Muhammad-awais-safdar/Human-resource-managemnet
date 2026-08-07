# 08 - Micrometer Custom Metrics

## Custom Business Metrics (`BusinessMetricsCollector`)
- `hr.tenants.total` / `hr.tenants.active`: Registered vs active customer tenant count
- `hr.employees.total`: Total managed employees
- `hr.attendance.today` / `.clockin.today` / `.clockout.today`: Attendance activity counters
- `hr.leaves.pending` / `.approved`: Leave request queue sizes
- `hr.payroll.runs.total` / `.failures.total`: Payroll execution counters
- `hr.recruitment.jobs.active` / `.candidates.total`: Hiring pipeline metrics
- `hr.finance.mrr.usd` / `.arr.usd`: Financial subscription metrics
- `hr.ai.requests.total`: AI Copilot invocation counter
- `hr.storage.usage.mb`: Tenant database and file attachment disk usage
