export const TOUR_REGISTRY = {
  'welcome-overview': {
    id: 'welcome-overview',
    title: 'Workspace Guided Overview',
    steps: [
      {
        target: "[data-tour='header-tenant-switcher']",
        title: 'Multi-Tenant Workspace Context',
        description: 'Easily switch between corporate subsidiaries, legal entities, and multi-tenant organization boundaries.',
        placement: 'bottom',
      },
      {
        target: "[data-tour='sidebar-nav']",
        title: 'Enterprise Navigation Shell',
        description: 'Access HR Workspace, Industry Capabilities, and Administration modules dynamically tuned to your role permissions.',
        placement: 'right',
      },
      {
        target: "[data-tour='dashboard-kpis']",
        title: 'Real-time Executive Metrics',
        description: 'Monitor active headcount, attendance rates, pending leave authorizations, and payroll disbursements live.',
        placement: 'bottom',
      },
      {
        target: "[data-tour='quick-actions']",
        title: 'One-Click Operational Actions',
        description: 'Quickly trigger employee onboarding, leave requests, shift assignments, or payroll runs.',
        placement: 'top',
      },
      {
        target: "[data-tour='help-center-button']",
        title: 'Help Center & Tutorials',
        description: 'Replay tours, read interactive feature guides, or search support topics at any time.',
        placement: 'left',
      },
    ],
  },
  'roles-rbac': {
    id: 'roles-rbac',
    title: 'Roles & RBAC Permission Tour',
    steps: [
      {
        target: "[data-tour='rbac-roles-list']",
        title: 'Defined Enterprise Roles',
        description: 'View custom workspace roles and default system roles configured for your organization.',
        placement: 'bottom',
      },
      {
        target: "[data-tour='rbac-permission-matrix']",
        title: 'Hierarchical Permission Matrix',
        description: 'Permissions are categorized cleanly by Module → Feature → Action (View, Create, Update, Delete).',
        placement: 'top',
      },
      {
        target: "[data-tour='rbac-developer-toggle']",
        title: 'Developer Key View',
        description: 'Toggle between human-readable permission titles and raw API permission identifiers.',
        placement: 'left',
      },
    ],
  },
  'employee-directory': {
    id: 'employee-directory',
    title: 'Employee Workforce Directory Tour',
    steps: [
      {
        target: "[data-tour='employee-table-search']",
        title: 'Workforce Search & Filters',
        description: 'Search employees by name, email, department, or employment status in real time.',
        placement: 'bottom',
      },
      {
        target: "[data-tour='add-employee-button']",
        title: 'Add Employee Onboarding',
        description: 'Register new personnel into your tenant workspace database with automated role assignment.',
        placement: 'left',
      },
    ],
  },
};
