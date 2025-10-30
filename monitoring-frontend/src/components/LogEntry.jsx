import React from 'react';
import { Clock, Server, Activity, Code, User } from 'lucide-react';
import { formatTime, formatLatency } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

export const LogEntry = ({ log, onClick }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'API_IN': return 'text-blue-400 bg-blue-500/20';
      case 'API_OUT': return 'text-purple-400 bg-purple-500/20';
      case 'PROCESSING': return 'text-green-400 bg-green-500/20';
      case 'AUTH': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'API_IN': return Activity;
      case 'API_OUT': return Activity;
      case 'PROCESSING': return Code;
      case 'AUTH': return User;
      default: return Server;
    }
  };

  const TypeIcon = getTypeIcon(log.type);

  return (
    <div 
      onClick={() => onClick && onClick(log)}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all cursor-pointer log-entry-new"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Type & Time */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${getTypeColor(log.type)}`}>
            <TypeIcon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                {log.type}
              </span>
              
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(log.timestamp)}
              </span>
              
              {log.connector && (
                <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-700 rounded">
                  {log.connector}
                </span>
              )}

              {log.service && (
                <span className="text-xs text-emerald-400 px-2 py-0.5 bg-emerald-500/20 rounded border border-emerald-500/50">
                  🔧 {log.service}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-blue-400">{log.method}</span>
              <span className="text-sm text-white font-mono truncate">{log.path}</span>
            </div>

            {log.message && (
              <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                {log.message}
              </p>
            )}

            {(log.messageId || log.endToEndId) && (
              <div className="flex gap-2 mt-2 text-xs">
                {log.messageId && (
                  <span className="text-slate-400">
                    <span className="text-slate-500">MSG:</span> {log.messageId}
                  </span>
                )}
                {log.endToEndId && (
                  <span className="text-slate-400">
                    <span className="text-slate-500">E2E:</span> {log.endToEndId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Status & Metrics */}
        <div className="flex items-start gap-3">
          <div className="text-right">
            <StatusBadge status={log.statusCode} success={log.success} size="sm" />
            {log.responseTimeMs !== undefined && (
              <div className="text-xs text-slate-400 mt-1">
                {formatLatency(log.responseTimeMs)}
              </div>
            )}
          </div>
        </div>
      </div>

      {log.clientIp && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <span className="text-xs text-slate-500">Client IP: </span>
          <span className="text-xs text-slate-400">{log.clientIp}</span>
        </div>
      )}
    </div>
  );
};
