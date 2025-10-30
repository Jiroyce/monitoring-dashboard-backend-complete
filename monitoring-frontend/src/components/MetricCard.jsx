import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon,
  color = 'blue',
  inverse = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    green: 'bg-green-500/20 border-green-500/50 text-green-400',
    red: 'bg-red-500/20 border-red-500/50 text-red-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    purple: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  };

  const getTrendColor = () => {
    if (change === 0) return 'text-gray-400';
    const isPositive = inverse ? change < 0 : change > 0;
    return isPositive ? 'text-green-400' : 'text-red-400';
  };

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm text-slate-400">{title}</div>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-white mb-2">
        {value}
      </div>
      
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="font-medium">{Math.abs(change)}%</span>
          {changeLabel && <span className="text-slate-400 ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
};
