import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, suffix = '', trend = 'neutral' }) => {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const bgColor = trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-gray-50';
  
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value}
            {suffix && <span className="text-lg text-gray-600">{suffix}</span>}
          </p>
          {change !== undefined && change !== null && (
            <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
              <span className="ml-1 font-medium">{change > 0 ? '+' : ''}{change}%</span>
              <span className="ml-1 text-gray-500">vs previous</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon size={24} className={trendColor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
