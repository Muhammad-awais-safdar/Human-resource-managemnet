'use client';

import React, { useState } from 'react';
import { Dialog } from '../primitives/Dialog';
import { Button } from '../primitives/Button';

export function OnboardingWizard({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { title: 'Welcome to Awais HR', desc: 'Let us set up your enterprise SaaS workspace in 10 simple guided steps.' },
    { title: 'Company Profile & Branding', desc: 'Configure organization name, primary color theme, logo URL, and workspace subdomains.' },
    { title: 'Industry Vertical Selection', desc: 'Select your enterprise vertical (AgriTech, Manufacturing, Retail, Healthcare, BFSI, IT Services).' },
    { title: 'Module Selection', desc: 'Enable Core HR, Payroll, ATS Recruitment, Attendance, Performance, or Expenses.' },
    { title: 'Organization Structure', desc: 'Define legal entities, cost centers, departments, and reporting hierarchy.' },
    { title: 'Workforce Setup', desc: 'Set up work shift schedules, overtime rules, and biometric check-in policies.' },
    { title: 'Roles & Access Matrix', desc: 'Configure fine-grained RBAC permissions for System Admins, HR Managers, and Employees.' },
    { title: 'Integration Hub', desc: 'Connect Slack, Microsoft Teams, QuickBooks, or biometric device webhooks.' },
    { title: 'Bulk Employee Import', desc: 'Upload CSV workforce rosters or invite team members via automated email links.' },
    { title: 'Workspace Launch!', desc: 'Your workspace is provisioned and ready for your entire enterprise workforce.' },
  ];

  const totalSteps = steps.length;
  const activeInfo = steps[currentStep - 1];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Step ${currentStep} of ${totalSteps}: ${activeInfo.title}`}
      description={activeInfo.desc}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-6 bg-slate-800/50 border border-slate-700/60 rounded-xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 font-extrabold text-lg flex items-center justify-center mx-auto">
            {currentStep}
          </div>
          <h4 className="text-base font-bold text-white">{activeInfo.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">{activeInfo.desc}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            isDisabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
            >
              Continue Step
            </Button>
          ) : (
            <Button variant="success" size="sm" onClick={onClose}>
              Launch Workspace
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
