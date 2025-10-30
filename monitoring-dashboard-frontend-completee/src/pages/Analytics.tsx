import React from 'react';
import { Card } from '@/components/ui/Card';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Advanced analytics and insights</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Analytics features coming soon...</p>
          <p className="text-sm text-gray-400 mt-2">This page will include trend analysis, heatmaps, and performance comparisons</p>
        </div>
      </Card>
    </div>
  );
};
