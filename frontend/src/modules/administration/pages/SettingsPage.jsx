import React, { useState } from 'react';
import { Card, CardTitle } from '@/core/primitives/Card';
import { Input, Select } from '@/core/primitives/Input';
import { Button } from '@/core/primitives/Button';

export function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-slate-500">Global tenant configuration & security policies</p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card header={<CardTitle>Organization Profile</CardTitle>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Legal Name" defaultValue="Awais HR Tech Solutions" />
            <Input label="Primary Subdomain" defaultValue="awais-hr" isDisabled />
            <Input label="Corporate Address" defaultValue="Suite 500, Innovation Tower" />
            <Select label="Default Currency" options={['USD ($)', 'PKR (Rs)', 'EUR (€)', 'GBP (£)']} />
          </div>
        </Card>

        <Card header={<CardTitle>Security & Compliance</CardTitle>}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">Require Multi-Factor Authentication (MFA)</p>
                <p className="text-[11px] text-slate-500">Enforce TOTP MFA for all admin accounts</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">Session Timeout</p>
                <p className="text-[11px] text-slate-500">Automatically log out inactive users after 30 minutes</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 cursor-pointer" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
