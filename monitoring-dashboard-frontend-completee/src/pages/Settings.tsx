import React from 'react';
import { Card } from '@/components/ui/Card';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure dashboard preferences</p>
      </div>
      <Card title="API Configuration">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
            <input
              type="text"
              value={import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}
              readOnly
              className="input w-full bg-gray-50"
            />
          </div>
        </div>
      </Card>
      <Card title="Display Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-refresh</p>
              <p className="text-sm text-gray-500">Automatically refresh data every minute</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </div>
  );
};
