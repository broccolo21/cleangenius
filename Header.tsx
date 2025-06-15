import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, MessageCircle, User, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Workforce Manager</h1>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm text-gray-500 mr-4">
                {user?.role === 'admin' ? 'Amministratore' : 
                 user?.role === 'employee' ? 'Dipendente' : 'Cliente'}
              </span>
              
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              <button className="ml-2 p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </button>

              <div className="ml-3 relative flex items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
                
                <button
                  onClick={logout}
                  className="ml-4 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}