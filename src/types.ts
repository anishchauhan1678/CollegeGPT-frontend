/**
 * CollegeGPT Type Declarations
 */

export type UserRole = 'student' | 'faculty' | 'admin' | 'superadmin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNo?: string;
  department?: string;
  semester?: number;
  gpa?: number;
  attendanceRate?: number;
  avatarUrl?: string;
  mobile?: string;
  previousCgpa?: number;
  password?: string;
}

export interface CollegeClass {
  id: string;
  subject: string;
  faculty: string;
  time: string;
  room: string;
  duration: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  department?: string;
  semester?: number;
}

export interface Notice {
  id: string;
  title: string;
  category: 'academic' | 'placement' | 'exam' | 'general';
  content: string;
  date: string;
  author: string;
  isUrgent: boolean;
}

export interface CollegeEvent {
  id: string;
  title: string;
  category: 'hackathon' | 'cultural' | 'sports' | 'seminar';
  description: string;
  date: string;
  location: string;
  attendeesCount: number;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: string;
  totalPoints: number;
}

export interface PlacementJob {
  id: string;
  company: string;
  position: string;
  ctc: string; // package e.g. "18 LPA"
  eligibility: string;
  deadline: string;
  status: 'open' | 'applied' | 'closed';
  category: 'tech' | 'management' | 'core';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string; // FAQ, MCQ, code, etc.
}

export interface ChatHistorySession {
  id: string;
  title: string;
  lastMessageText: string;
  timestamp: string;
  messagesCount: number;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  specialization: string;
  imageUrl?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  hod: string;
  studentsCount: number;
  labsCount: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  dueDate?: string;
  status: 'borrowed' | 'available' | 'reserved';
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: string; // e.g., 'PDF' | 'Markdown'
  size: string;
  date: string;
  subject: string;
  content?: string; // Hidden text content for simulation in AI Summarizer
}

export interface StudentRecord {
  id: string;
  name: string;
  roll: string;
  gpa: number;
  attendance: number;
  status: string;
  email?: string;
  department?: string;
  mobile?: string;
  semester?: number;
  previousCgpa?: number;
}

export interface ExamSchedule {
  id: string;
  subject: string;
  code: string;
  date: string;
  session: string;
}

export interface CollegeSubject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  startingDate: string;
  deadline: string;
  requiredDocuments: string[];
  description: string;
  eligibility: string;
  status: 'open' | 'closed';
}

