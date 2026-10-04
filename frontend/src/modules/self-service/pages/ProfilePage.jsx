import React from 'react';
import { Card } from '@/core/primitives/Card';
import { Input } from '@/core/primitives/Input';
import { Button } from '@/core/primitives/Button';
import { useAuth } from '@/core/context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">User Account Profile</h1>
        <p className="text-xs text-slate-500">Manage personal preferences and credentials</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Muhammad Awais'}</h2>
            <p className="text-xs text-blue-600 font-semibold">{user?.email || 'awais@company.com'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
              SUPER_ADMIN
            </span>
          </div>
        </div>

        <form className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={user?.name || 'Muhammad Awais'} />
            <Input label="Email Address" defaultValue={user?.email || 'awais@company.com'} isDisabled />
            <Input label="Phone Number" defaultValue="+92 300 1234567" />
            <Input label="Designation" defaultValue="Lead Enterprise Architect" isDisabled />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button">Update Profile</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
