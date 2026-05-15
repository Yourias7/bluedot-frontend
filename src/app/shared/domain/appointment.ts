import { ChatMessage } from "./chat-message";
import { AppointmentStatus } from "./appointment-status";

export type Appointment = {
  id: number;
  status: AppointmentStatus;

  specialty: string;
  date: string;
  startTime: string;
  endTime: string;

  patientName: string;
  patientPhone: string;
  patientEmail: string;

  patientMessage: string;

  conversation: ChatMessage[];
};