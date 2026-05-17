export type CalendarDay = {
  number: number;
  date: string;
  hasActivity: boolean;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  hasPendingAppointment?: boolean;
  hasConfirmedAppointment?: boolean;
};