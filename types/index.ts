export type UserRole = 'parent' | 'advocate' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  isApproved: boolean;
}

export interface ParentProfile extends User {
  role: 'parent';
  children: Child[];
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth?: string;
  grade?: string;
  school?: string;
  notes?: string;
}

export interface AdvocateProfile extends User {
  role: 'advocate';
  credentials: string;
  expertise: string[];
  availability: string;
  bio: string;
  cases: string[]; // IDs of assigned cases
}

export interface IEP {
  id: string;
  parentId: string;
  childId: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  summary?: IEPSummary;
  advocateId?: string;
}

export interface IEPSummary {
  goals: string[];
  services: string[];
  accommodations: string[];
  notes: string;
  generatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Case {
  id: string;
  parentId: string;
  advocateId: string;
  childId: string;
  iepId: string;
  status: 'pending' | 'active' | 'completed';
  helpType: string;
  createdAt: string;
}