import { ChatMessage } from './chat-message';
import { AppointmentStatus } from './appointment-status';

export type Appointment = {
  id: number;
  status: AppointmentStatus;

  specialty: string;
  specialties: string[];
  date: string;
  startTime: string;
  endTime: string;

  createdAt?: string | null;
  expiredDateTime?: string | null;

  patientName: string;
  doctorName: string;
  doctorId: number;
  patientPhone: string;
  patientEmail: string;

  patientMessage: string;

  conversation: ChatMessage[];
};