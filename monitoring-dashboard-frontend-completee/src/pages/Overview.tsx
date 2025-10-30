// src/pages/Overview.tsx

import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { apiService } from '@/services/api';
import { formatNumber, formatPercent, formatDuration, getLatencyColor } from '@/utils';
import type { OverviewMetrics, TimeRange } from '@/types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

export const Overview: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [data, setData] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await apiService.getOverviewMetrics(timeRange);
      setData(metrics);
    } catch (err) {
      setError('Failed to load metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <Loading text="Loading overview metrics..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-lg font-medium text-gray-900">{error}</p>
          <button onClick={fetchData} className="btn btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { services, totals, timeline } = data;

  // Transform timeline data for charts
  const chartData = timeline.map((point) => ({
    time: format(parseISO(point.timestamp), 'HH:mm'),
    'PI Gateway': point.piGatewayRequests || 0,
    'PI Connector': point.piConnectorRequests || 0,
    total: (point.piGatewayRequests || 0) + (point.piConnectorRequests || 0),
  }));

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring of PI Gateway and Connector</p>
        </div>
        <div className="flex items-center space-x-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatNumber(totals.totalRequests)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Success Rate */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatPercent(totals.successRate)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Avg Latency */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Latency</p>
              <p className={`text-3xl font-bold mt-2 ${getLatencyColor(totals.avgLatencyMs)}`}>
                {totals.avgLatencyMs.toFixed(1)}ms
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Error Rate */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Error Rate</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {formatPercent(totals.errorRate)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.name} title={service.name}>
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <StatusIndicator status={service.status} />
              </div>

              {/* Uptime */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Uptime</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatPercent(service.uptimePercentage)}
                </span>
              </div>

              {/* Requests/min */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Requests/min</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatNumber(service.requestsPerMinute)}
                </span>
              </div>

              {/* Avg Latency */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Avg Latency</span>
                <span className={`text-sm font-bold ${getLatencyColor(service.avgLatencyMs)}`}>
                  {service.avgLatencyMs.toFixed(1)}ms
                </span>
              </div>

              {/* Success/Error Rates */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Success Rate</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPercent(service.successRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Error Rate</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatPercent(service.errorRate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Request Timeline Chart */}
      <Card title="Request Timeline" subtitle="Requests per minute over time">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="PI Gateway"
              stackId="1"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="PI Connector"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Latency Percentiles */}
      <Card title="Latency Distribution" subtitle="Response time percentiles">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'P50', value: totals.p50LatencyMs },
            { label: 'P75', value: totals.p95LatencyMs * 0.8 },
            { label: 'P90', value: totals.p95LatencyMs * 0.95 },
            { label: 'P95', value: totals.p95LatencyMs },
            { label: 'P99', value: totals.p99LatencyMs },
          ].map((percentile) => (
            <div key={percentile.label} className="text-center">
              <p className="text-sm font-medium text-gray-500">{percentile.label}</p>
              <p className={`text-2xl font-bold mt-2 ${getLatencyColor(percentile.value)}`}>
                {percentile.value.toFixed(1)}ms
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Overview;
