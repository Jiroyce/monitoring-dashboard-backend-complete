import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const PiGatewayDetails = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const metricsData = await api.getConnectorMetrics('pi-gateway', timeRange);
      setData(metricsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading && !data) {
    return <LoadingSpinner message="Loading Pi-Gateway metrics..." />;
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800">Unable to load data from API. Please check your backend connection.</p>
        </div>
      </div>
    );
  }

  // Transform timeline data for latency chart
  const latencyData = data.latencyTimeline?.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    avg: point.avgLatencyMs || 0,
    p95: point.p95LatencyMs || 0,
    p99: point.p99LatencyMs || 0
  })) || [];

  // Transform timeline data for requests chart
  const requestsData = data.requestTimeline?.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    requests: point.requests || 0,
    errors: point.errors || 0
  })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚀 Pi-Gateway Details</h1>
          <p className="text-gray-600 mt-1">Detailed metrics and performance analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchData}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {['1h', '6h', '24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Health Status */}
      <div className={`card border-2 ${
        data.status === 'healthy' ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' :
        data.status === 'degraded' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
        'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <span className={`inline-block w-4 h-4 rounded-full mr-2 animate-pulse ${
                data.status === 'healthy' ? 'bg-green-500' :
                data.status === 'degraded' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></span>
              {(data.status || 'UNKNOWN').toUpperCase()}
            </h2>
            <p className="text-gray-600">
              {data.status === 'healthy' ? 'All systems operational' :
               data.status === 'degraded' ? 'Performance degraded' :
               'Service down'}
            </p>
          </div>
          <div className="text-6xl">🚀</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Uptime"
          value={(data.uptimePercentage || 0).toFixed(2)}
          suffix="%"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Requests/min"
          value={(data.requestsPerMinute || 0).toLocaleString()}
          change={data.requestsChange}
          icon={TrendingUp}
          trend={data.requestsChange > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Avg Latency"
          value={(data.avgLatencyMs || 0).toFixed(0)}
          suffix="ms"
          change={data.latencyChange}
          icon={Clock}
          trend={data.latencyChange < 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Error Rate"
          value={(data.errorRate || 0).toFixed(1)}
          suffix="%"
          change={data.errorRateChange}
          icon={AlertCircle}
          trend={data.errorRateChange < 0 ? 'down' : 'up'}
        />
      </div>

      {/* Latency Trends */}
      {latencyData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Latency Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} name="Average" />
              <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} name="P95" />
              <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} name="P99" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Requests and Errors */}
      {requestsData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Requests and Errors</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
              <Bar dataKey="errors" fill="#ef4444" name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Endpoints */}
      {data.topEndpoints && data.topEndpoints.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Endpoint</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requests</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg Latency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Errors</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Error Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topEndpoints.map((endpoint, index) => {
                  const errorRate = ((endpoint.errors / endpoint.requests) * 100).toFixed(2);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{endpoint.path}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{endpoint.requests.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{endpoint.avgLatencyMs.toFixed(0)}ms</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-semibold">{endpoint.errors}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          parseFloat(errorRate) < 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {errorRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiGatewayDetails;
