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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    const appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));

    this.returnDate = this.route.snapshot.queryParams['date'] ?? null;

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
    return this.transferSlots.filter(slot => slot.status === 'free');
  }

  loadAppointment(appointmentId: number) {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading appointment details for id:', appointmentId);

    this.doctorservice.loadAppointmentById(appointmentId).subscribe({
      next: appointment => {
        console.log('Loaded appointment details:', appointment);

        this.appointment = appointment;

        this.transferDate = appointment.date;
        this.transferDateObject = this.parseDate(appointment.date);
        this.loadTransferSlots();

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

    this.doctorservice.acceptAppointment(this.appointment.id).subscribe(() => {
      this.goBack();
    });
  }

  rejectAppointment() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorservice.rejectAppointment(this.appointment.id).subscribe(() => {
      this.goBack();
    });
  }

  rejectAppointmentAndDisableSlot() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorservice.rejectAppointmentAndDisableSlot(this.appointment.id).subscribe(() => {
      this.goBack();
    });
  }

  openTransferModal() {
    if (this.appointment === undefined) {
      return;
    }

    this.transferDate = this.appointment.date;
    this.transferDateObject = this.parseDate(this.appointment.date);
    this.selectedTransferSlot = null;

    this.loadTransferSlots();
    this.showTransferModal = true;
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedTransferSlot = null;
  }

  onTransferDateChanged(date: Date | null) {
    if (date === null) {
      return;
    }

    this.transferDateObject = date;
    this.transferDate = this.formatDate(date);
    this.selectedTransferSlot = null;

    this.loadTransferSlots();
  }

  loadTransferSlots() {
    this.transferSlots = this.doctorservice.getTransferSlotsByDate(this.transferDate);
  }

  selectTransferSlot(slot: AvailabilitySlot) {
    if (slot.status !== 'free') {
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
    ).subscribe(success => {
      if (!success || this.appointment === undefined) {
        return;
      }

      this.loadAppointment(this.appointment.id);
      this.closeTransferModal();
    });
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
}