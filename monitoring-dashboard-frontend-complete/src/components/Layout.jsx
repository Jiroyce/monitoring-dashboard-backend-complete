import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  BarChart3, 
  Bell,
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '../utils/helpers';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Logs', href: '/logs', icon: FileText },
    { name: 'Processing Tracer', href: '/processing', icon: Activity },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Alertes', href: '/alerts', icon: Bell },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-200',
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center mb-8 px-3">
            <Activity className="w-8 h-8 text-primary-600" />
            <span className="ml-3 text-xl font-bold text-gray-900">
              Monitoring
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="absolute bottom-4 left-0 right-0 px-3 space-y-2">
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 mr-3" />
              Paramètres
            </button>
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-0'
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Status indicator */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span>API Connectée</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-600 rounded-lg hover:bg-gray-100">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
                </button>

                {/* User menu */}
                <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-medium">
                    U
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">Utilisateur</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
