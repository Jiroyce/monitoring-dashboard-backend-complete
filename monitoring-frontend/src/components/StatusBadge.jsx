import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

export const StatusBadge = ({ status, success, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const getStatusInfo = () => {
    if (success === true) {
      return {
        color: 'bg-green-500/20 text-green-400 border-green-500/50',
        icon: CheckCircle,
        label: status || 'Success'
      };
    }
    
    if (success === false) {
      if (status >= 500) {
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/50',
          icon: XCircle,
          label: `${status} Error`
        };
      }
      if (status >= 400) {
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
          icon: AlertCircle,
          label: `${status} Error`
        };
      }
      return {
        color: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: XCircle,
        label: status || 'Failed'
      };
    }

    // Status basé uniquement sur le code
    if (status >= 200 && status < 300) {
      return {
        color: 'bg-green-500/20 text-green-400 border-green-500/50',
        icon: CheckCircle,
        label: status
      };
    }
    if (status >= 300 && status < 400) {
      return {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        icon: Clock,
        label: status
      };
    }
    if (status >= 400 && status < 500) {
      return {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        icon: AlertCircle,
        label: status
      };
    }
    if (status >= 500) {
      return {
        color: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: XCircle,
        label: status
      };
    }

    return {
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      icon: Clock,
      label: status || 'Unknown'
    };
  };

  const info = getStatusInfo();
  const Icon = info.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full border
      ${sizeClasses[size]} ${info.color}
    `}>
      <Icon className="w-3 h-3" />
      {info.label}
    </span>
  );
};
