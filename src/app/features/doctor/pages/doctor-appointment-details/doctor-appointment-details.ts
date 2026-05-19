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
export class DoctorAppointmentDetails {
  appointment: Appointment | undefined;
  returnDate: string | null = null;

  isLoading = false;
  errorMessage = '';

  showTransferModal = false;

  transferDateObject: Date = new Date();
  transferDate = '';
  transferSlots: AvailabilitySlot[] = [];
  selectedTransferSlot: AvailabilitySlot | null = null;

  todayDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.todayDate.setHours(0, 0, 0, 0);

    const appointmentIdParam = this.route.snapshot.paramMap.get('appointmentId');
    const appointmentId = Number(appointmentIdParam);

    this.returnDate = this.route.snapshot.queryParams['date'] ?? null;

    if (appointmentIdParam === null || Number.isNaN(appointmentId)) {
      this.router.navigate(['/doctor/appointments']);
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

  get availableTransferSlots(): AvailabilitySlot[] {
    return this.transferSlots.filter(slot =>
      slot.status === 'free' && !this.isTransferSlotInPast(slot)
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
    if (this.appointment === undefined) {
      return;
    }

    this.doctorservice.acceptAppointment(this.appointment.id).subscribe({
      next: () => {
        this.goBack();
      },
      error: error => {
        console.error('Failed to accept appointment:', error);
      }
    });
  }

  rejectAppointment() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorservice.rejectAppointment(this.appointment.id).subscribe({
      next: () => {
        this.goBack();
      },
      error: error => {
        console.error('Failed to reject appointment:', error);
      }
    });
  }

  rejectAppointmentAndDisableSlot() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorservice.rejectAppointmentAndDisableSlot(this.appointment.id).subscribe({
      next: () => {
        this.goBack();
      },
      error: error => {
        console.error('Failed to reject appointment and disable slot:', error);
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
    this.showTransferModal = true;

    this.loadTransferSlots();
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedTransferSlot = null;
    this.transferSlots = [];
  }

  onTransferDateChanged(date: Date | null) {
    if (date === null) {
      return;
    }

    if (this.isDateInPast(date)) {
      return;
    }

    this.transferDateObject = date;
    this.transferDate = this.formatDate(date);
    this.selectedTransferSlot = null;
    this.transferSlots = [];

    this.loadTransferSlots();
  }

  loadTransferSlots() {
    if (!this.transferDate) {
      return;
    }

    this.doctorservice.loadDoctorAvailabilitySlotsByDate(this.transferDate).subscribe({
      next: slots => {
        this.transferSlots = slots.filter(slot =>
          slot.status === 'free' && !this.isTransferSlotInPast(slot)
        );

        this.changeDetectorRef.detectChanges();
      },
      error: error => {
        console.error('Failed to load transfer slots:', error);

        this.transferSlots = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  selectTransferSlot(slot: AvailabilitySlot) {
    if (slot.status !== 'free' || this.isTransferSlotInPast(slot)) {
      return;
    }

    this.selectedTransferSlot = slot;
  }

  confirmTransfer() {
    if (this.appointment === undefined || this.selectedTransferSlot === null) {
      return;
    }

    this.doctorservice.transferAppointment(
      this.appointment.id,
      this.transferDate,
      this.selectedTransferSlot
    ).subscribe({
      next: success => {
        if (!success || this.appointment === undefined) {
          return;
        }

        this.loadAppointment(this.appointment.id);
        this.closeTransferModal();
      },
      error: error => {
        console.error('Failed to transfer appointment:', error);
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
    this.router.navigate(['/doctor/appointments'], {
      queryParams: this.returnDate !== null
        ? { date: this.returnDate }
        : {}
    });
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

  private isDateInPast(date: Date): boolean {
    const selectedDate = new Date(date);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  }
}