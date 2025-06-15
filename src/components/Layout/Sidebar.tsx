import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MapPin, 
  Camera, 
  FileText, 
  MessageSquare,
  Settings,
  Clock,
  Navigation,
  Hand
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();

  const adminSections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Dipendenti', icon: Users },
    { id: 'clients', label: 'Clienti', icon: Users },
    { id: 'schedule', label: 'Calendario', icon: Calendar },
    { id: 'tracking', label: 'Mappa Live', icon: MapPin },
    { id: 'media', label: 'Media & AI', icon: Camera },
    { id: 'reports', label: 'Report', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  const employeeSections = [
    { id: 'schedule', label: 'I Miei Impegni', icon: Clock },
    { id: 'camera', label: 'Foto & Video', icon: Camera },
    { id: 'navigation', label: 'Navigazione', icon: Navigation },
    { id: 'gestures', label: 'Monitoraggio Gesti', icon: Hand },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  const clientSections = [
    { id: 'reports', label: 'I Miei Report', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  const sections = user?.role === 'admin' ? adminSections :
                   user?.role === 'employee' ? employeeSections : clientSections;

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}