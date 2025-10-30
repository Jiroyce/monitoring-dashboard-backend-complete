import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, TrendingUp, Activity, Server, AlertCircle } from 'lucide-react';

export const Navigation = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/logs', icon: FileText, label: 'Logs Explorer' },
    { path: '/gateway', icon: Server, label: 'Pi-Gateway' },
    { path: '/connector', icon: Activity, label: 'Pi-Connector' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="px-6">
        <div className="flex gap-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-3 text-sm font-medium
                border-b-2 transition-all
                ${isActive 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50'}
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
