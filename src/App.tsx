import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Admin/Dashboard';
import { EmployeeManagement } from './components/Admin/EmployeeManagement';
import { ClientManagement } from './components/Admin/ClientManagement';
import { ScheduleManagement } from './components/Admin/ScheduleManagement';
import { LiveTracking } from './components/Admin/LiveTracking';
import { ClientManagement } from './components/Admin/ClientManagement';
import { ScheduleManagement } from './components/Admin/ScheduleManagement';
import { LiveTracking } from './components/Admin/LiveTracking';
import { MediaAnalysis } from './components/Admin/MediaAnalysis';
import { ReportsManagement } from './components/Admin/ReportsManagement';
import { Settings } from './components/Admin/Settings';
import { MySchedule } from './components/Employee/MySchedule';
import { CameraCapture } from './components/Employee/CameraCapture';
import { Navigation } from './components/Employee/Navigation';
import { GestureMonitoring } from './components/Employee/GestureMonitoring';
import { Navigation } from './components/Employee/Navigation';
import { GestureMonitoring } from './components/Employee/GestureMonitoring';
import { ChatInterface } from './components/Chat/ChatInterface';
import { ClientReports } from './components/Client/ClientReports';

function App() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState(() => {
    if (user?.role === 'admin') return 'dashboard';
    if (user?.role === 'employee') return 'schedule';
    return 'reports';
  });

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
        case 'clients':
          return <ClientManagement />;
        case 'schedule':
          return <ScheduleManagement />;
        case 'tracking':
          return <LiveTracking />;
        case 'clients':
          return <ClientManagement />;
        case 'schedule':
          return <ScheduleManagement />;
        case 'tracking':
          return <LiveTracking />;
        case 'media':
          return <MediaAnalysis />;
        case 'reports':
          return <ReportsManagement />;
        case 'chat':
          return <ChatInterface />;
        case 'settings':
          return <Settings />;
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
        case 'navigation':
          return <Navigation />;
        case 'gestures':
          return <GestureMonitoring />;
        case 'navigation':
          return <Navigation />;
        case 'gestures':
          return <GestureMonitoring />;
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