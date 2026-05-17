import { Component } from '@angular/core';
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

  showTransferModal = false;

  transferDateObject: Date = new Date();
  transferDate: string = '';
  transferSlots: AvailabilitySlot[] = [];
  selectedTransferSlot: AvailabilitySlot | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService
  ) {
    const appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));

    this.returnDate = this.route.snapshot.queryParams['date'] ?? null;
    this.appointment = this.doctorservice.getAppointmentById(appointmentId);

    if (this.appointment !== undefined) {
      this.transferDate = this.appointment.date;
      this.transferDateObject = this.parseDate(this.appointment.date);
      this.loadTransferSlots();
    }
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

  restoreRejectedAppointment() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorservice.restoreRejectedAppointment(this.appointment.id).subscribe(() => {
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
      if (!success) {
        return;
      }

      this.appointment = this.doctorservice.getAppointmentById(this.appointment!.id);
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