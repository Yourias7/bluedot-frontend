// Domain model for an appointment as returned by the backend API
// comprehends with returned Dto from backend
import { ChatMessage } from './chat-message';
import { AppointmentStatus } from './appointment-status';

export type Appointment = {
  id: number;
  status: AppointmentStatus;

  specialty: string;
  specialties: string[]; // all specialties the doctor covers
  date: string;          // ISO date string (YYYY-MM-DD)
  startTime: string;
  endTime: string;

  createdAt?: string | null;
  expiredDateTime?: string | null; // set when the appointment slot has lapsed

  patientName: string;
  doctorName: string;
  doctorId: number;
  patientPhone: string;
  patientEmail: string;

  patientMessage: string; // free-text note submitted by the patient at booking

  conversation: ChatMessage[];
};