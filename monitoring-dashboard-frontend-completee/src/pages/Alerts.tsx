import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { apiService } from '@/services/api';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await apiService.getActiveAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Alerts</h1>
        <p className="text-gray-500 mt-1">Monitor and manage system alerts</p>
      </div>
      {loading ? (
        <Loading text="Loading alerts..." />
      ) : alerts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium text-gray-900">No active alerts</p>
            <p className="text-sm text-gray-500 mt-2">All systems are operating normally</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Badge variant={alert.severity === 'critical' ? 'error' : 'warning'}>{alert.severity}</Badge>
                    <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                  </div>
                  <p className="text-gray-600 mt-2">{alert.description}</p>
                </div>
                <button className="btn btn-primary ml-4">Acknowledge</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
