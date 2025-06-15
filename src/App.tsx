import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from '../LoginForm';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { Dashboard } from '../Dashboard';
import { EmployeeManagement } from '../EmployeeManagement';
import { MediaAnalysis } from '../MediaAnalysis';
import { MySchedule } from '../MySchedule';
import { CameraCapture } from '../CameraCapture';
import { ChatInterface } from '../ChatInterface';
import { ClientReports } from '../ClientReports';

function App() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    // Admin sections
    if (user.role === 'admin') {
      switch (activeSection) {
        case 'dashboard':
          return <Dashboard />;
        case 'employees':
          return <EmployeeManagement />;
        case 'media':
          return <MediaAnalysis />;
        case 'chat':
          return <ChatInterface />;
        default:
          return <Dashboard />;
      }
    }

    // Employee sections
    if (user.role === 'employee') {
      switch (activeSection) {
        case 'schedule':
          return <MySchedule />;
        case 'camera':
          return <CameraCapture />;
        case 'chat':
          return <ChatInterface />;
        default:
          return <MySchedule />;
      }
    }

    // Client sections
    if (user.role === 'client') {
      switch (activeSection) {
        case 'reports':
          return <ClientReports />;
        case 'chat':
          return <ChatInterface />;
        default:
          return <ClientReports />;
      }
    }

    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;