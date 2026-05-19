import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

import { AvailabilitySlot } from '../../../../shared/domain/availability-slot';
import { DoctorService } from '../../../../shared/services/doctor-service';

type PrimeNgCalendarDate = {
  day: number;
  month: number;
  year: number;
  otherMonth?: boolean;
};

@Component({
  selector: 'app-doctor-availability',
  imports: [FormsModule, DatePickerModule],
  templateUrl: './doctor-availability.html',
  styleUrl: './doctor-availability.scss'
})
export class DoctorAvailability {
  selectedDate: string | null = null;
  selectedDateObject: Date = new Date();

  todayDate: Date = new Date();

  availabilitySlots: AvailabilitySlot[] = [];

  pendingAppointmentDates: string[] = [];
  confirmedAppointmentDates: string[] = [];

  isEditMode = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.todayDate.setHours(0, 0, 0, 0);

    let selectedDate = this.route.snapshot.queryParams['date'];

    if (!selectedDate || this.isDateTextInPast(selectedDate)) {
      selectedDate = this.getFormattedDate();
    }

    this.selectedDate = selectedDate;
    this.selectedDateObject = this.parseDate(selectedDate);

    this.loadSlotsForSelectedDate();
  }

  get isSelectedDateInPast(): boolean {
    if (this.selectedDate === null) {
      return false;
    }

    return this.isDateTextInPast(this.selectedDate);
  }

  get visibleAvailabilitySlots(): AvailabilitySlot[] {
    return this.availabilitySlots.filter(slot => !this.isSlotInPast(slot));
  }

  onDateChanged(date: Date | null) {
    if (date === null) {
      return;
    }

    if (this.isDateInPast(date)) {
      return;
    }

    this.selectedDateObject = date;
    this.selectedDate = this.formatDate(date);
    this.isEditMode = false;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: this.selectedDate },
      queryParamsHandling: 'merge'
    });

    this.loadSlotsForSelectedDate();
  }

  loadSlotsForSelectedDate() {
    if (this.selectedDate === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.doctorservice.loadDoctorAppointments().subscribe({
      next: () => {
        this.pendingAppointmentDates = this.doctorservice.getPendingAppointmentDates();
        this.confirmedAppointmentDates = this.doctorservice.getBookedAppointmentDates();

        if (this.selectedDate === null) {
          return;
        }

        this.doctorservice.loadDoctorAvailabilitySlotsByDate(this.selectedDate).subscribe({
          next: slots => {
            this.availabilitySlots = slots;
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          },
          error: error => {
            console.error('Failed to load availability slots:', error);

            this.availabilitySlots = [];
            this.isLoading = false;
            this.errorMessage = 'Δεν ήταν δυνατή η φόρτωση της διαθεσιμότητας.';
            this.changeDetectorRef.detectChanges();
          }
        });
      },
      error: error => {
        console.error('Failed to load appointments before availability:', error);

        this.availabilitySlots = [];
        this.pendingAppointmentDates = [];
        this.confirmedAppointmentDates = [];
        this.isLoading = false;
        this.errorMessage = 'Δεν ήταν δυνατή η φόρτωση των ραντεβού.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  toggleEditMode() {
    if (this.isSelectedDateInPast) {
      this.isEditMode = false;
      return;
    }

    this.isEditMode = !this.isEditMode;
  }

  openSlot(slot: AvailabilitySlot) {
    if (this.isEditMode || this.isSlotInPast(slot)) {
      return;
    }

    if (slot.appointmentId !== null) {
      this.router.navigate(['/doctor/appointments', slot.appointmentId], {
        queryParams: this.selectedDate !== null
          ? { date: this.selectedDate }
          : {}
      });
    }
  }

  disableSlot(slot: AvailabilitySlot) {
    if (
      this.selectedDate === null ||
      slot.status !== 'free' ||
      this.isSelectedDateInPast ||
      this.isSlotInPast(slot)
    ) {
      return;
    }

    this.doctorservice.updateDoctorAvailabilitySlot(
      this.selectedDate,
      slot,
      'Unavailable'
    ).subscribe({
      next: () => {
        this.loadSlotsForSelectedDate();
      },
      error: error => {
        console.error('Failed to disable slot:', error);
        this.errorMessage = 'Δεν ήταν δυνατή η απενεργοποίηση της ώρας.';
      }
    });
  }

  enableSlot(slot: AvailabilitySlot) {
    if (
      this.selectedDate === null ||
      slot.status !== 'disabled' ||
      this.isSelectedDateInPast ||
      this.isSlotInPast(slot)
    ) {
      return;
    }

    this.doctorservice.updateDoctorAvailabilitySlot(
      this.selectedDate,
      slot,
      'Available'
    ).subscribe({
      next: () => {
        this.loadSlotsForSelectedDate();
      },
      error: error => {
        console.error('Failed to enable slot:', error);
        this.errorMessage = 'Δεν ήταν δυνατή η ενεργοποίηση της ώρας.';
      }
    });
  }

  isSlotInPast(slot: AvailabilitySlot): boolean {
    if (this.selectedDate === null) {
      return false;
    }

    const [hours, minutes] = slot.endTime.split(':').map(Number);

    const slotEndDateTime = this.parseDate(this.selectedDate);
    slotEndDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();

    return slotEndDateTime <= now;
  }

  isPendingCalendarDate(calendarDate: PrimeNgCalendarDate): boolean {
    const formattedDate = this.formatPrimeNgCalendarDate(calendarDate);

    if (formattedDate === null) {
      return false;
    }

    return this.pendingAppointmentDates.includes(formattedDate);
  }

  isConfirmedCalendarDate(calendarDate: PrimeNgCalendarDate): boolean {
    const formattedDate = this.formatPrimeNgCalendarDate(calendarDate);

    if (formattedDate === null) {
      return false;
    }

    return this.confirmedAppointmentDates.includes(formattedDate);
  }

  getCalendarDayClass(calendarDate: PrimeNgCalendarDate): string {
    const classes = ['calendar-day-content'];

    if (this.isPendingCalendarDate(calendarDate)) {
      classes.push('pending-calendar-day');
      return classes.join(' ');
    }

    if (this.isConfirmedCalendarDate(calendarDate)) {
      classes.push('confirmed-calendar-day');
    }

    return classes.join(' ');
  }

  getFormattedDate(): string {
    const date = new Date();

    return this.formatDate(date);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const format = (num: number) => num.toString().padStart(2, '0');

    return `${year}-${format(month)}-${format(day)}`;
  }

  parseDate(dateText: string): Date {
    const parts = dateText.split('-');

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    return new Date(year, month, day);
  }

  private isDateTextInPast(dateText: string): boolean {
    return this.isDateInPast(this.parseDate(dateText));
  }

  private isDateInPast(date: Date): boolean {
    const selectedDate = new Date(date);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  }

  private formatPrimeNgCalendarDate(calendarDate: PrimeNgCalendarDate): string | null {
    if (calendarDate.otherMonth) {
      return null;
    }

    const month = calendarDate.month + 1;

    const monthText = month.toString().padStart(2, '0');
    const dayText = calendarDate.day.toString().padStart(2, '0');

    return `${calendarDate.year}-${monthText}-${dayText}`;
  }
}