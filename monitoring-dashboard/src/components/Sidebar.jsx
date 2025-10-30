import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, Server, FileText, GitBranch, TrendingUp } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Overview' },
    { path: '/pi-gateway', icon: Activity, label: 'Pi-Gateway' },
    { path: '/pi-connector', icon: Server, label: 'Pi-Connector' },
    { path: '/logs', icon: FileText, label: 'Logs Explorer' },
    { path: '/processing', icon: GitBranch, label: 'Processing Tracer' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">Monitoring</h1>
        <p className="text-gray-400 text-sm">Dashboard v1.0</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <p>Backend: localhost:8080</p>
          <p className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Connected</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
