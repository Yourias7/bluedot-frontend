import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

import { Appointment } from '../../../../shared/domain/appointment';
import { AvailabilitySlot } from '../../../../shared/domain/availability-slot';
import { DoctorService } from '../../../../shared/services/doctor-service';

@Component({
  selector: 'app-doctor-appointment-details',
  imports: [FormsModule, DatePickerModule],
  templateUrl: './doctor-appointment-details.html',
  styleUrl: './doctor-appointment-details.scss'
})
// Doctor appointment details page: view appointment info, accept/reject, or transfer to a new slot
export class DoctorAppointmentDetails {
  appointment: Appointment | undefined;
  returnDate: string | null = null; // passed as a query param to restore the calendar date on back-nav

  isLoading = false;
  errorMessage = '';

  isActionLoading = false;   // guards accept/reject buttons against double-submit
  actionErrorMessage = '';

  showTransferModal = false;

  transferDateObject: Date = new Date(); // Date object bound to the PrimeNG date picker
  transferDate = '';                     // YYYY-MM-DD string derived from transferDateObject
  transferSlots: AvailabilitySlot[] = [];
  selectedTransferSlot: AvailabilitySlot | null = null;

  todayDate: Date = new Date(); // used as the min-date constraint on the transfer date picker

  isTransferLoading = false;
  transferErrorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.todayDate.setHours(0, 0, 0, 0); // strip time so date comparisons work correctly

    const appointmentIdParam = this.route.snapshot.paramMap.get('appointmentId');
    const appointmentId = Number(appointmentIdParam);

    this.returnDate = this.route.snapshot.queryParams['date'] ?? null;

    if (appointmentIdParam === null || Number.isNaN(appointmentId)) {
      this.router.navigate(['/doctor/appointments']); // invalid route param — bail out early
      return;
    }

    this.loadAppointment(appointmentId);
  }

  get isPendingAppointment(): boolean {
    return this.appointment?.status === 'pending';
  }

  get isBookedAppointment(): boolean {
    return this.appointment?.status === 'booked';
  }

  get isRejectedAppointment(): boolean {
    return this.appointment?.status === 'rejected';
  }

  get pendingTimeLeftMessage(): string {
    if (this.appointment === undefined || this.appointment.status !== 'pending') {
      return '';
    }

    if (!this.appointment.createdAt) {
      return 'Απαντήστε μέσα σε 24 ώρες από τη δημιουργία του αιτήματος.';
    }

    const createdAt = new Date(this.appointment.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return 'Απαντήστε μέσα σε 24 ώρες από τη δημιουργία του αιτήματος.';
    }

    const deadline = new Date(createdAt);
    deadline.setHours(deadline.getHours() + 24);

    const now = new Date();
    const timeLeftMs = deadline.getTime() - now.getTime();

    if (timeLeftMs <= 0) {
      return 'Το αίτημα έχει ξεπεράσει το όριο των 24 ωρών.';
    }

    return `Απομένουν ${this.formatTimeLeft(timeLeftMs)} για απάντηση.`;
  }

  get availableTransferSlots(): AvailabilitySlot[] {
    return this.transferSlots.filter(slot =>
      slot.status === 'free' &&
      !this.isTransferSlotInPast(slot) &&
      this.hasValidAvailabilityId(slot)
    );
  }

  get canConfirmTransfer(): boolean {
    return (
      this.selectedTransferSlot !== null &&
      this.hasValidAvailabilityId(this.selectedTransferSlot) &&
      !this.isTransferLoading
    );
  }

  loadAppointment(appointmentId: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.doctorservice.loadAppointmentById(appointmentId).subscribe({
      next: appointment => {
        this.appointment = appointment;

        this.transferDate = appointment.date;
        this.transferDateObject = this.parseDate(appointment.date);

        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: error => {
        console.error('Appointment details loading failed:', error);

        this.isLoading = false;
        this.errorMessage = 'Δεν ήταν δυνατή η φόρτωση του ραντεβού.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  acceptAppointment() {
    if (this.appointment === undefined || this.isActionLoading) {
      return;
    }

    this.isActionLoading = true;
    this.actionErrorMessage = '';

    this.doctorservice.acceptAppointment(this.appointment.id).subscribe({
      next: () => {
        this.isActionLoading = false;
        this.goBack();
      },
      error: error => {
        console.error('Failed to accept appointment:', error);
        this.isActionLoading = false;
        this.actionErrorMessage = 'Δεν ήταν δυνατή η αποδοχή του αιτήματος. Δοκιμάστε ξανά.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  rejectAppointment() {
    if (this.appointment === undefined || this.isActionLoading) {
      return;
    }

    this.isActionLoading = true;
    this.actionErrorMessage = '';

    this.doctorservice.rejectAppointment(this.appointment.id).subscribe({
      next: () => {
        this.isActionLoading = false;
        this.goBack();
      },
      error: error => {
        console.error('Failed to reject appointment:', error);
        this.isActionLoading = false;
        this.actionErrorMessage = 'Δεν ήταν δυνατή η απόρριψη του αιτήματος. Δοκιμάστε ξανά.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  rejectAppointmentAndDisableSlot() {
    if (this.appointment === undefined || this.isActionLoading) {
      return;
    }

    this.isActionLoading = true;
    this.actionErrorMessage = '';

    this.doctorservice.rejectAppointmentAndDisableSlot(this.appointment.id).subscribe({
      next: () => {
        this.isActionLoading = false;
        this.goBack();
      },
      error: error => {
        console.error('Failed to reject appointment and disable slot:', error);
        this.isActionLoading = false;
        this.actionErrorMessage = 'Δεν ήταν δυνατή η απόρριψη και απενεργοποίηση της ώρας. Δοκιμάστε ξανά.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  openTransferModal() {
    if (this.appointment === undefined) {
      return;
    }

    const appointmentDate = this.parseDate(this.appointment.date);

    if (this.isDateInPast(appointmentDate)) {
      this.transferDateObject = new Date();
      this.transferDate = this.formatDate(new Date());
    } else {
      this.transferDateObject = appointmentDate;
      this.transferDate = this.appointment.date;
    }

    this.selectedTransferSlot = null;
    this.transferSlots = [];
    this.transferErrorMessage = '';
    this.isTransferLoading = false;
    this.showTransferModal = true;

    this.loadTransferSlots();
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedTransferSlot = null;
    this.transferSlots = [];
    this.transferErrorMessage = '';
    this.isTransferLoading = false;
  }

  onTransferDateChanged(date: Date | null) {
    if (date === null) {
      return;
    }

    if (this.isDateInPast(date)) {
      this.transferDateObject = this.parseDate(this.transferDate || this.formatDate(new Date()));
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.transferDateObject = date;
    this.transferDate = this.formatDate(date);
    this.selectedTransferSlot = null;
    this.transferSlots = [];
    this.transferErrorMessage = '';

    this.loadTransferSlots();
  }

  loadTransferSlots() {
    if (!this.transferDate) {
      return;
    }

    this.transferErrorMessage = '';

    this.doctorservice.loadDoctorAvailabilitySlotsByDate(this.transferDate).subscribe({
      next: slots => {
        const freeFutureSlots = slots.filter(slot =>
          slot.status === 'free' && !this.isTransferSlotInPast(slot)
        );

        const invalidIdSlots = freeFutureSlots.filter(slot => !this.hasValidAvailabilityId(slot));

        this.transferSlots = freeFutureSlots.filter(slot => this.hasValidAvailabilityId(slot));

        if (invalidIdSlots.length > 0) {
          this.transferErrorMessage =
            'Οι διαθέσιμες ώρες φορτώθηκαν χωρίς πραγματικό Availability ID από το backend. Δεν μπορεί να γίνει αλλαγή ραντεβού μέχρι να επιστρέφεται το id του slot.';
        }

        this.changeDetectorRef.detectChanges();
      },
      error: error => {
        console.error('Failed to load transfer slots:', error);

        this.transferSlots = [];
        this.transferErrorMessage = 'Δεν ήταν δυνατή η φόρτωση διαθέσιμων ωρών.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  selectTransferSlot(slot: AvailabilitySlot) {
    if (
      slot.status !== 'free' ||
      this.isTransferSlotInPast(slot) ||
      !this.hasValidAvailabilityId(slot)
    ) {
      return;
    }

    this.selectedTransferSlot = slot;
    this.transferErrorMessage = '';
  }

  confirmTransfer() {
    if (this.appointment === undefined || this.selectedTransferSlot === null) {
      return;
    }

    if (!this.hasValidAvailabilityId(this.selectedTransferSlot)) {
      this.transferErrorMessage =
        'Δεν υπάρχει έγκυρο Availability ID για την επιλεγμένη ώρα.';
      return;
    }

    this.isTransferLoading = true;
    this.transferErrorMessage = '';

    this.doctorservice.transferAppointment(
      this.appointment.id,
      this.transferDate,
      this.selectedTransferSlot
    ).subscribe({
      next: success => {
        this.isTransferLoading = false;

        if (!success || this.appointment === undefined) {
          this.transferErrorMessage = 'Η αλλαγή ραντεβού δεν ολοκληρώθηκε.';
          this.changeDetectorRef.detectChanges();
          return;
        }

        this.loadAppointment(this.appointment.id);
        this.closeTransferModal();
      },
      error: error => {
        console.error('Failed to transfer appointment:', error);

        this.isTransferLoading = false;
        this.transferErrorMessage = this.getTransferErrorMessage(error);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  isTransferSlotInPast(slot: AvailabilitySlot): boolean {
    if (!this.transferDate) {
      return false;
    }

    const [hours, minutes] = slot.endTime.split(':').map(Number);

    const slotEndDateTime = this.parseDate(this.transferDate);
    slotEndDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();

    return slotEndDateTime <= now;
  }

  goBack() {
    this.router.navigate(['/doctor/appointments']);
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

  private isDateInPast(date: Date): boolean {
    const selectedDate = new Date(date);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  }

  private hasValidAvailabilityId(slot: AvailabilitySlot | null): boolean {
    // negative ids are local fallbacks assigned during mapping and cannot be sent to the backend
    return slot !== null && Number.isFinite(slot.id) && slot.id > 0;
  }

  private getTransferErrorMessage(error: any): string {
    if (error?.error?.error) {
      return error.error.error;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    return 'Η αλλαγή ραντεβού απέτυχε. Δοκιμάστε ξανά.';
  }
}