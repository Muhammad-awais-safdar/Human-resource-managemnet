import React, { useState, useEffect } from 'react';
import { Card } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Dialog } from '@/core/primitives/Dialog';
import { Input, Select } from '@/core/primitives/Input';
import { Plus, RefreshCw } from 'lucide-react';
import { timeService } from '../services/timeService';

export function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Annual PTO',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await timeService.getLeaves();
      const list = Array.isArray(response)
        ? response
        : response?.data || response?.leaves || [];
      setLeaves(list);
    } catch (err) {
      setError(err.message || 'Failed to load leaves from server.');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await timeService.requestLeave(formData);
      setIsOpen(false);
      setFormData({ type: 'Annual PTO', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      alert(err.message || 'Error submitting leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Leave Category', accessor: (row) => row.type || row.leaveType || 'PTO', sortable: true },
    { header: 'Start Date', accessor: (row) => row.startDate || row.start_date || 'N/A' },
    { header: 'End Date', accessor: (row) => row.endDate || row.end_date || 'N/A' },
    { header: 'Duration', accessor: (row) => `${row.days || 1} day(s)` },
    { header: 'Status', accessor: (row) => <StatusPill status={row.status || 'PENDING'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Leaves & Time-Off Tracker</h1>
          <p className="text-xs text-slate-500">Live leave requests from Spring Boot API backend</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchLeaves}>
            Refresh
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsOpen(true)}>Request Leave</Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading leave requests...</div>
        ) : (
          <DataTable columns={columns} data={leaves} pageSize={5} />
        )}
      </Card>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Submit Time-Off Request"
        description="Request manager sign-off for leave"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitLeave} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4">
          <Select
            label="Leave Category"
            options={['Annual PTO', 'Sick Leave', 'Casual Leave', 'Unpaid Leave']}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            isRequired
          />
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            isRequired
          />
          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            isRequired
          />
          <Input
            label="Reason / Notes"
            placeholder="Brief explanation..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </form>
      </Dialog>
    </div>
  );
}
