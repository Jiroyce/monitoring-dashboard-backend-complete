// src/components/ui/StatusIndicator.tsx

import React from 'react';
import { cn, getStatusDotColor } from '@/utils';

interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusLabels = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
    unknown: 'Unknown',
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className={cn('inline-block rounded-full', sizeClasses[size], getStatusDotColor(status))} />
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">{label || statusLabels[status]}</span>
      )}
    </div>
  );
};

export default StatusIndicator;
