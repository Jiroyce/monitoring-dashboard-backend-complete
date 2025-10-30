import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Activity, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [trends, setTrends] = useState(null);
  const [topClients, setTopClients] = useState([]);
  const [connectorBreakdown, setConnectorBreakdown] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState(null);
  const [topEndpoints, setTopEndpoints] = useState(null);
  const [heatmap, setHeatmap] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        trendsData,
        clientsData,
        breakdownData,
        statusData,
        endpointsData,
        heatmapData
      ] = await Promise.all([
        api.getTrends('requests', timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30),
        api.getTopClients(5, timeRange),
        api.getConnectorBreakdown(timeRange),
        api.getStatusDistribution(timeRange),
        api.getTopEndpoints('slowest', 5, timeRange),
        api.getHeatmap(7)
      ]);
      
      setTrends(trendsData);
      setTopClients(clientsData);
      setConnectorBreakdown(breakdownData);
      setStatusDistribution(statusData);
      setTopEndpoints(endpointsData);
      setHeatmap(heatmapData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  if (loading && !trends) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  // Transform trends data
  const trendsChartData = trends?.data?.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    requests: point.requests || 0,
    avgLatency: point.avgLatencyMs || 0,
    errorRate: point.errorRate || 0
  })) || [];

  // Transform connector breakdown
  const connectorBreakdownData = connectorBreakdown ? [
    { name: 'Pi-Gateway', value: connectorBreakdown.piGatewayPercentage || 0, color: '#3b82f6' },
    { name: 'Pi-Connector', value: connectorBreakdown.piConnectorPercentage || 0, color: '#10b981' }
  ] : [];

  // Transform status distribution
  const statusChartData = statusDistribution ? Object.entries(statusDistribution).map(([status, data]) => ({
    status,
    count: data.count || 0,
    color: status.startsWith('2') ? '#10b981' : status.startsWith('4') ? '#f59e0b' : '#ef4444'
  })) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📈 Analytics</h1>
          <p className="text-gray-600 mt-1">Advanced insights and trends</p>
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
        {['7d', '14d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
          </button>
        ))}
      </div>

      {/* Trends Over Time */}
      {trendsChartData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Trends Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
              <Line yAxisId="right" type="monotone" dataKey="avgLatency" stroke="#f59e0b" strokeWidth={2} name="Avg Latency (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} name="Error Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Connector Breakdown & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {connectorBreakdownData.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connector Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={connectorBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {connectorBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {statusChartData.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status Code Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Clients */}
      {topClients.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            Top Clients
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requests</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg Latency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Error Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topClients.map((client, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{client.clientIp}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{client.requestCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{client.avgLatencyMs.toFixed(0)}ms</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        client.errorRate < 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {client.errorRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slowest Endpoints */}
      {topEndpoints && topEndpoints.endpoints && topEndpoints.endpoints.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Activity size={20} className="mr-2" />
            Slowest Endpoints
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topEndpoints.endpoints} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="path" type="category" stroke="#6b7280" width={180} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="avgLatencyMs" fill="#ef4444" radius={[0, 8, 8, 0]} name="Avg Latency (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Traffic Heatmap */}
      {heatmap && heatmap.days && heatmap.days.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Heatmap (Requests per Hour)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-2 py-2 bg-gray-50 text-xs font-semibold">Day</th>
                  {Array.from({ length: 24 }, (_, i) => (
                    <th key={i} className="border border-gray-300 px-2 py-2 bg-gray-50 text-xs font-semibold">
                      {i.toString().padStart(2, '0')}h
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.days.map((dayData, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-300 px-2 py-2 font-semibold bg-gray-50 text-sm">
                      {dayData.day}
                    </td>
                    {dayData.hours.map((hourData, colIndex) => {
                      const value = hourData.requests || 0;
                      const maxRequests = Math.max(...heatmap.days.flatMap(d => d.hours.map(h => h.requests || 0)));
                      const intensity = maxRequests > 0 ? Math.min(value / maxRequests, 1) : 0;
                      const bgColor = `rgba(59, 130, 246, ${intensity})`;
                      const textColor = intensity > 0.5 ? 'white' : 'black';
                      return (
                        <td
                          key={colIndex}
                          className="border border-gray-300 px-2 py-2 text-center text-xs"
                          style={{ backgroundColor: bgColor, color: textColor }}
                          title={`${hourData.hour}:00 - ${value} requests`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>
              <span>Low Traffic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}></div>
              <span>Medium Traffic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
              <span>High Traffic</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
