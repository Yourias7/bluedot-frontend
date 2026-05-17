import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CalendarDay } from '../../../../shared/domain/calendar-day';
import { DoctorService } from '../../../../shared/services/doctor-service';

@Component({
  selector: 'app-doctor-home',
  imports: [],
  templateUrl: './doctor-home.html',
  styleUrl: './doctor-home.scss'
})
export class DoctorHome {
  weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  calendarDays: CalendarDay[] = [];

  currentDate = new Date();
  maxCalendarDate = new Date();

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  constructor(
    private router: Router,
    private doctorService: DoctorService
  ) {
    this.currentDate = new Date();
    this.currentDate.setDate(1);

    this.maxCalendarDate = new Date();
    this.maxCalendarDate.setMonth(this.maxCalendarDate.getMonth() + 1);

    this.buildCalendar();
  }

  get currentMonthTitle(): string {
    const month = this.monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();

    return `${month} ${year}`;
  }

  get canGoToNextMonth(): boolean {
    const nextMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    const maxMonth = new Date(
      this.maxCalendarDate.getFullYear(),
      this.maxCalendarDate.getMonth(),
      1
    );

    return nextMonth <= maxMonth;
  }

  get hasPendingAppointments(): boolean {
    return this.calendarDays.some(day => day.hasPendingAppointment);
  }

  goToPreviousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );

    this.buildCalendar();
  }

  goToNextMonth() {
    if (!this.canGoToNextMonth) {
      return;
    }

    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    this.buildCalendar();
  }

  buildCalendar() {
    const pendingAppointmentDates = this.doctorService.getPendingAppointmentDates();
    const confirmedAppointmentDates = this.doctorService.getBookedAppointmentDates();
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstWeekDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];

    for (let i = 0; i < firstWeekDay; i++) {
      days.push({
        number: 0,
        date: '',
        hasActivity: false,
        isCurrentMonth: false
      });
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const date = new Date(year, month, dayNumber);
      const formattedDate = this.formatDate(date);
      const hasPendingAppointment = pendingAppointmentDates.includes(formattedDate);
      const hasConfirmedAppointment = confirmedAppointmentDates.includes(formattedDate);

      days.push({
        number: dayNumber,
        date: formattedDate,
        hasActivity: hasPendingAppointment || hasConfirmedAppointment,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        hasPendingAppointment: hasPendingAppointment,
        hasConfirmedAppointment: hasConfirmedAppointment
      });
    }

    this.calendarDays = days;
  }

  openDay(day: CalendarDay) {
    if (!day.isCurrentMonth) {
      return;
    }

    this.router.navigate(['/doctor/availability'], {
      queryParams: { date: day.date }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const monthText = month.toString().padStart(2, '0');
    const dayText = day.toString().padStart(2, '0');

    return `${year}-${monthText}-${dayText}`;
  }

  isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }
}