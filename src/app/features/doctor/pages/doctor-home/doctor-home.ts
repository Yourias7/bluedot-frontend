import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CalendarDay } from '../../../../shared/domain/calendar-day';
import { Appointment } from '../../../../shared/domain/appointment';
import { DoctorService } from '../../../../shared/services/doctor-service';
import { AuthenticationServices } from '../../../../shared/services/authentication-services';

@Component({
  selector: 'app-doctor-home',
  imports: [],
  templateUrl: './doctor-home.html',
  styleUrl: './doctor-home.scss'
})
export class DoctorHome implements OnInit, OnDestroy {
  weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  calendarDays: CalendarDay[] = [];

  currentDate = new Date();
  maxCalendarDate = new Date();

  currentUserName = '';

  isLoadingAppointments = false;

  private subscriptions = new Subscription();

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
    private doctorService: DoctorService,
    private authenticationServices: AuthenticationServices,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentDate = new Date();
    this.currentDate.setDate(1);

    this.maxCalendarDate = new Date();
    this.maxCalendarDate.setMonth(this.maxCalendarDate.getMonth() + 1);

    this.buildCalendar();
  }

  ngOnInit() {
    this.subscriptions.add(
      this.authenticationServices.currentUserName$.subscribe(name => {
        this.currentUserName = name;
        this.changeDetectorRef.detectChanges();
      })
    );

    this.loadAppointmentsForCalendar();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get doctorName(): string {
    if (!this.currentUserName) {
      return 'γιατρέ';
    }

    if (this.currentUserName.includes('@')) {
      return this.currentUserName
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .trim();
    }

    return this.currentUserName;
  }

  get pendingAppointments(): Appointment[] {
    return this.doctorService.getDoctorAppointments()
      .filter(appointment => appointment.status === 'pending');
  }

  get pendingAppointmentCount(): number {
    return this.pendingAppointments.length;
  }

  get hasPendingAppointments(): boolean {
    return this.pendingAppointmentCount > 0;
  }

  get pendingRequestReminderMessage(): string {
    const appointment = this.getMostUrgentPendingAppointment();

    if (appointment === null || !appointment.createdAt) {
      if (this.pendingAppointmentCount === 1) {
        return 'Απαντήστε στο αίτημα μέσα σε 24 ώρες από τη δημιουργία του.';
      }

      return 'Απαντήστε στα αιτήματα μέσα σε 24 ώρες από τη δημιουργία τους.';
    }

    const createdAt = new Date(appointment.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return 'Απαντήστε στα εκκρεμή αιτήματα μέσα σε 24 ώρες από τη δημιουργία τους.';
    }

    const deadline = new Date(createdAt);
    deadline.setHours(deadline.getHours() + 24);

    const now = new Date();
    const timeLeftMs = deadline.getTime() - now.getTime();

    if (timeLeftMs <= 0) {
      return 'Υπάρχει αίτημα που έχει ξεπεράσει το όριο των 24 ωρών.';
    }

    return `Απομένουν ${this.formatTimeLeft(timeLeftMs)} για απάντηση σε αίτημα.`;
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

  loadAppointmentsForCalendar() {
    this.isLoadingAppointments = true;

    this.doctorService.loadDoctorAppointments().subscribe({
      next: () => {
        this.isLoadingAppointments = false;
        this.buildCalendar();
        this.changeDetectorRef.detectChanges();
      },
      error: error => {
        console.error('Could not load doctor appointments for homepage:', error);

        this.isLoadingAppointments = false;
        this.buildCalendar();
        this.changeDetectorRef.detectChanges();
      }
    });
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
    if (!day.isCurrentMonth || this.isPastCalendarDay(day)) {
      return;
    }

    this.router.navigate(['/doctor/availability'], {
      queryParams: { date: day.date }
    });
  }

  getDayButtonClass(day: CalendarDay): string {
    const classes = ['day-button'];

    if (!day.isCurrentMonth) {
      classes.push('empty-day');
    }

    if (this.isPastCalendarDay(day)) {
      classes.push('past-day');
    }

    if (day.hasConfirmedAppointment) {
      classes.push('confirmed-day');
    }

    if (day.hasPendingAppointment) {
      classes.push('pending-day');
    }

    if (day.isToday) {
      classes.push('today-day');
    }

    return classes.join(' ');
  }

  isPastCalendarDay(day: CalendarDay): boolean {
    if (!day.isCurrentMonth || !day.date) {
      return false;
    }

    const calendarDate = this.parseDate(day.date);
    const today = new Date();

    calendarDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return calendarDate < today;
  }

  goToRequests() {
    this.router.navigate(['/doctor/appointments'], {
      queryParams: { tab: 'requests' }
    });
  }

  goToAvailability() {
    this.router.navigate(['/doctor/availability'], {
      queryParams: { date: this.formatDate(new Date()) }
    });
  }

  private getMostUrgentPendingAppointment(): Appointment | null {
    const pendingWithCreatedAt = this.pendingAppointments
      .filter(appointment => appointment.createdAt)
      .sort((a, b) => {
        const firstCreatedAt = new Date(a.createdAt as string).getTime();
        const secondCreatedAt = new Date(b.createdAt as string).getTime();

        return firstCreatedAt - secondCreatedAt;
      });

    return pendingWithCreatedAt[0] ?? this.pendingAppointments[0] ?? null;
  }

  private formatTimeLeft(timeLeftMs: number): string {
    const totalMinutes = Math.ceil(timeLeftMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} λεπτά`;
    }

    if (minutes === 0) {
      return `${hours} ώρες`;
    }

    return `${hours} ώρες και ${minutes} λεπτά`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const monthText = month.toString().padStart(2, '0');
    const dayText = day.toString().padStart(2, '0');

    return `${year}-${monthText}-${dayText}`;
  }

  parseDate(dateText: string): Date {
    const parts = dateText.split('-');

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    return new Date(year, month, day);
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