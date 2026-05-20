// calendar day model used across the app calendar components
export type CalendarDay = {
  number: number;
  date: string;
  hasActivity: boolean;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  hasPendingAppointment?: boolean;
  hasConfirmedAppointment?: boolean;
};