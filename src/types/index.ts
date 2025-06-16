export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'client';
  avatar?: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Employee extends User {
  role: 'employee';
  teamId?: string;
  schedule: ScheduleEntry[];
  location?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
}

export interface Client extends User {
  role: 'client';
  companyName?: string;
  address?: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
  color: string;
  description?: string;
}

export interface ScheduleEntry {
  id: string;
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

export interface MediaFile {
  id: string;
  employeeId: string;
  scheduleEntryId?: string;
  type: 'photo' | 'video';
  url: string;
  caption?: string;
  timestamp: Date;
  aiAnalysis?: AIAnalysis;
  status: 'pending' | 'analyzed' | 'approved' | 'sent';
}

export interface AIAnalysis {
  description: string;
  observations: string[];
  recommendations: string[];
  confidence: number;
  tags: string[];
}

export interface Report {
  id: string;
  clientId: string;
  employeeId: string;
  mediaFiles: MediaFile[];
  content: string;
  status: 'draft' | 'approved' | 'sent';
  createdAt: Date;
  sentAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  status: 'present' | 'absent' | 'vacation' | 'sick' | 'permission';
  notes?: string;
  totalHours?: number;
}