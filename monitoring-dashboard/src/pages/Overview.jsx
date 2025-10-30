import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import ServiceStatus from '../components/ServiceStatus';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Overview = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1h');
  const [data, setData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, errorsData] = await Promise.all([
        api.getOverview(timeRange),
        api.getErrors('all', 5)
      ]);
      setData(overviewData);
      setErrors(errorsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading && !data) {
    return <LoadingSpinner message="Loading dashboard..." />;
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

  // Transform timeline data for charts
  const timelineData = data.timeline?.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    piGateway: point.piGatewayRequests || 0,
    piConnector: point.piConnectorRequests || 0,
    success: point.successRate || 0,
    error: point.errorRate || 0
  })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of Pi-Gateway and Pi-Connector</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
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

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.services?.map((service) => (
          <ServiceStatus
            key={service.name}
            name={service.name}
            status={service.status}
            uptime={service.uptimePercentage || 0}
            latency={service.avgLatencyMs || 0}
            requestsPerMin={service.requestsPerMinute || 0}
            onClick={() => navigate(`/${service.name.toLowerCase().replace(' ', '-')}`)}
          />
        ))}
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Requests"
            value={(data.totals?.totalRequests || 0).toLocaleString()}
            change={data.totals?.requestsChangePercent}
            icon={Activity}
            trend={data.totals?.requestsChangePercent > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Success Rate"
            value={(data.totals?.successRate || 0).toFixed(1)}
            suffix="%"
            change={data.totals?.successRateChange}
            icon={CheckCircle}
            trend={data.totals?.successRateChange > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Error Rate"
            value={(data.totals?.errorRate || 0).toFixed(1)}
            suffix="%"
            change={data.totals?.errorRateChange}
            icon={XCircle}
            trend={data.totals?.errorRateChange > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Avg Latency"
            value={(data.totals?.avgLatencyMs || 0).toFixed(0)}
            suffix="ms"
            change={data.totals?.latencyChange}
            icon={Clock}
            trend={data.totals?.latencyChange < 0 ? 'down' : 'up'}
          />
          <StatCard
            title="P95 Latency"
            value={(data.totals?.p95LatencyMs || 0).toFixed(0)}
            suffix="ms"
            change={data.totals?.p95Change}
            icon={TrendingUp}
            trend={data.totals?.p95Change < 0 ? 'down' : 'up'}
          />
          <StatCard
            title="Timeout Rate"
            value={(data.totals?.timeoutRate || 0).toFixed(1)}
            suffix="%"
            change={data.totals?.timeoutChange}
            icon={AlertCircle}
            trend={data.totals?.timeoutChange < 0 ? 'down' : 'up'}
          />
        </div>
      </div>

      {/* Requests Timeline */}
      {timelineData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Requests Timeline</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="piGateway" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Pi-Gateway"
              />
              <Area 
                type="monotone" 
                dataKey="piConnector" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Pi-Connector"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Success vs Error Rate */}
      {timelineData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Success vs Error Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Success %"
              />
              <Line 
                type="monotone" 
                dataKey="error" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Error %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Errors */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Errors</h2>
          <button 
            onClick={() => navigate('/logs')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {errors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent errors 🎉</p>
          ) : (
            errors.map((error, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {error.method} {error.path}
                    </p>
                    <p className="text-sm text-gray-600">
                      {error.connector} • {error.statusCode} • {error.error || 'Error'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
