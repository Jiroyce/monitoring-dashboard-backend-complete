import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { formatTime, formatRelativeTime } from '../utils/formatters';

export const Header = ({ lastUpdate, onRefresh, refreshing }) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Monitoring Dashboard</h1>
            <p className="text-sm text-slate-400">Pi-Gateway & Pi-Connector</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <div className="text-right">
              <div className="text-xs text-slate-400">Dernière mise à jour</div>
              <div className="text-sm text-white font-medium">
                {formatTime(lastUpdate)}
                <span className="text-xs text-slate-400 ml-2">
                  ({formatRelativeTime(lastUpdate)})
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              bg-blue-600 hover:bg-blue-700 text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/50">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            <span className="text-sm text-green-400 font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
