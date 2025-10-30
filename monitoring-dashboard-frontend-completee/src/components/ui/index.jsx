import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

// ============================================================================
// CARD COMPONENT
// ============================================================================

export const Card = ({ children, className, ...props }) => {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn('card-header', className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className, ...props }) => {
  return (
    <div className={cn('card-body', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export const Badge = ({ children, variant = 'info', className, ...props }) => {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  };

  return (
    <span className={cn('badge', variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, loading = false }) => {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <div className="mt-2 h-8 w-24 loading-shimmer rounded"></div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                )}
              </>
            )}
          </div>
          {Icon && (
            <div className="ml-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              {trend.direction === 'up' ? (
                <span className="text-success-600 text-sm font-medium">
                  ↑ {trend.value}%
                </span>
              ) : (
                <span className="text-danger-600 text-sm font-medium">
                  ↓ {trend.value}%
                </span>
              )}
              <span className="ml-2 text-sm text-gray-500">{trend.label}</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// ============================================================================
// STATUS INDICATOR COMPONENT
// ============================================================================

export const StatusIndicator = ({ status, text, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    healthy: 'bg-success-500',
    degraded: 'bg-warning-500',
    down: 'bg-danger-500',
    unknown: 'bg-gray-400',
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        'rounded-full',
        sizeClasses[size],
        colorClasses[status],
        'animate-pulse'
      )}></div>
      {text && (
        <span className="text-sm font-medium text-gray-700">{text}</span>
      )}
    </div>
  );
};

// ============================================================================
// LOADING COMPONENT
// ============================================================================

export const Loading = ({ text = 'Chargement...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      <p className="mt-4 text-sm text-gray-600">{text}</p>
    </div>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && (
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

export const ErrorState = ({ title, message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="p-3 bg-danger-100 rounded-full">
        <svg className="w-12 h-12 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {message && (
        <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 btn btn-primary"
        >
          Réessayer
        </button>
      )}
    </div>
  );
};

// ============================================================================
// SKELETON COMPONENT (for loading states)
// ============================================================================

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('loading-shimmer rounded', className)}
      {...props}
    />
  );
};

// ============================================================================
// METRIC DISPLAY COMPONENT
// ============================================================================

export const MetricDisplay = ({ label, value, unit, trend, loading = false }) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      {loading ? (
        <Skeleton className="mt-1 h-6 w-20" />
      ) : (
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
          {trend && (
            <span className={cn(
              'text-sm font-medium',
              trend > 0 ? 'text-success-600' : 'text-danger-600'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

export const ProgressBar = ({ value, max = 100, color = 'primary', showLabel = false }) => {
  const percentage = (value / max) * 100;
  
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    danger: 'bg-danger-600',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// ============================================================================
// TABS COMPONENT
// ============================================================================

export const Tabs = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// ============================================================================
// TOOLTIP COMPONENT (simple)
// ============================================================================

export const Tooltip = ({ children, text, position = 'top' }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div className={cn(
        'absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity',
        'bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap',
        position === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        position === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
        position === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
        position === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2'
      )}>
        {text}
      </div>
    </div>
  );
};
