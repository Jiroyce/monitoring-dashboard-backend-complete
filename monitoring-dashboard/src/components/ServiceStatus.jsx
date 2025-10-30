import React from 'react';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';

const ServiceStatus = ({ name, status, uptime, latency, requestsPerMin, onClick }) => {
  const statusConfig = {
    healthy: { color: 'bg-green-500', text: 'HEALTHY', dot: 'bg-green-500' },
    degraded: { color: 'bg-yellow-500', text: 'DEGRADED', dot: 'bg-yellow-500' },
    down: { color: 'bg-red-500', text: 'DOWN', dot: 'bg-red-500' },
  };

  const config = statusConfig[status] || statusConfig.healthy;

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${config.dot} animate-pulse`}></span>
          <span className={`text-sm font-semibold ${config.color.replace('bg-', 'text-')}`}>
            {config.text}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Activity size={18} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Uptime</p>
            <p className="text-lg font-bold text-gray-900">{uptime}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock size={18} className="text-purple-500" />
          <div>
            <p className="text-xs text-gray-500">Latency</p>
            <p className="text-lg font-bold text-gray-900">{latency}ms</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 col-span-2">
          <TrendingUp size={18} className="text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Requests/min</p>
            <p className="text-lg font-bold text-gray-900">{requestsPerMin.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatus;
