// availability slot model used across the app
// comprehends with returned Dto from backend
import { SlotStatus } from "./slot-status";

export type AvailabilitySlot = {
  id: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  appointmentId: number | null;
};