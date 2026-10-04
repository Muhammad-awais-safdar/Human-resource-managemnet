import React, { useState, useEffect } from 'react';
import { Card } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Dialog } from '@/core/primitives/Dialog';
import { Input, Select } from '@/core/primitives/Input';
import { UserPlus, RefreshCw } from 'lucide-react';
import { employeeService } from '../services/employeeService';

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123',
    department: 'Engineering',
    role: 'Software Engineer',
  });

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeService.getAllEmployees();
      const list = Array.isArray(response)
        ? response
        : response?.data || response?.employees || [];
      setEmployees(list);
    } catch (err) {
      setError(err.message || 'Failed to load employee directory from server.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await employeeService.createEmployee(formData);
      setIsAddModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: 'password123',
        department: 'Engineering',
        role: 'Software Engineer',
      });
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Error creating employee profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: (row) => row.employeeCode || row.id, sortable: true },
    { header: 'Name', accessor: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.name || row.email, sortable: true },
    { header: 'Email', accessor: 'email', sortable: true },
    { header: 'Department', accessor: (row) => row.department || row.departmentName || 'N/A', sortable: true },
    { header: 'Job Title', accessor: (row) => row.role || row.jobTitle || 'Employee', sortable: true },
    { header: 'Status', accessor: (row) => <StatusPill status={row.status || 'ACTIVE'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs text-slate-500">Live workforce records from Spring Boot backend engine</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchEmployees}>
            Refresh
          </Button>
          <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
            Add Employee
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading workforce directory...</div>
        ) : (
          <DataTable
            columns={columns}
            data={employees}
            pageSize={10}
            searchPlaceholder="Search employees by name, email, or department..."
          />
        )}
      </Card>

      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        description="Provision new employee profile and credentials in tenant workspace"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateEmployee} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Employee'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <Input
            label="First Name"
            placeholder="e.g. John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            isRequired
          />
          <Input
            label="Last Name"
            placeholder="e.g. Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            isRequired
          />
          <Select
            label="Department"
            options={['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations']}
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            isRequired
          />
          <Input
            label="Job Title"
            placeholder="e.g. Software Engineer"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            isRequired
          />
        </form>
      </Dialog>
    </div>
  );
}
