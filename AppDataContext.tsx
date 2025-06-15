import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Employee, Client, Team, ScheduleEntry, MediaFile, Report, ChatMessage } from '../types';

interface AppDataContextType {
  employees: Employee[];
  clients: Client[];
  teams: Team[];
  schedule: ScheduleEntry[];
  mediaFiles: MediaFile[];
  reports: Report[];
  chatMessages: ChatMessage[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addClient: (client: Client) => void;
  addTeam: (team: Team) => void;
  addScheduleEntry: (entry: ScheduleEntry) => void;
  addMediaFile: (file: MediaFile) => void;
  updateMediaFile: (id: string, updates: Partial<MediaFile>) => void;
  addChatMessage: (message: ChatMessage) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Mock data
const mockEmployees: Employee[] = [
  {
    id: 'employee-1',
    name: 'Luigi Rossi',
    email: 'luigi@company.com',
    role: 'employee',
    createdAt: new Date(),
    isActive: true,
    schedule: [],
    location: {
      lat: 41.9028,
      lng: 12.4964,
      timestamp: new Date(),
    },
  },
  {
    id: 'employee-2',
    name: 'Maria Bianchi',
    email: 'maria@company.com',
    role: 'employee',
    createdAt: new Date(),
    isActive: true,
    schedule: [],
    location: {
      lat: 41.8919,
      lng: 12.5113,
      timestamp: new Date(),
    },
  },
];

const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Anna Cliente',
    email: 'anna@client.com',
    role: 'client',
    companyName: 'Condominio Verde',
    address: 'Via Roma 123, Roma',
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: 'client-2',
    name: 'Paolo Amministratore',
    email: 'paolo@admin.com',
    role: 'client',
    companyName: 'Condominio Rosso',
    address: 'Via Milano 456, Roma',
    createdAt: new Date(),
    isActive: true,
  },
];

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [teams, setTeams] = useState<Team[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    ));
  };

  const addClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };

  const addTeam = (team: Team) => {
    setTeams(prev => [...prev, team]);
  };

  const addScheduleEntry = (entry: ScheduleEntry) => {
    setSchedule(prev => [...prev, entry]);
  };

  const addMediaFile = (file: MediaFile) => {
    setMediaFiles(prev => [...prev, file]);
  };

  const updateMediaFile = (id: string, updates: Partial<MediaFile>) => {
    setMediaFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  return (
    <AppDataContext.Provider value={{
      employees,
      clients,
      teams,
      schedule,
      mediaFiles,
      reports,
      chatMessages,
      addEmployee,
      updateEmployee,
      addClient,
      addTeam,
      addScheduleEntry,
      addMediaFile,
      updateMediaFile,
      addChatMessage,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}