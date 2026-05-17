import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

import { AvailabilitySlot } from '../../../../shared/domain/availability-slot';
import { DoctorService } from '../../../../shared/services/doctor-service';

@Component({
  selector: 'app-doctor-availability',
  imports: [FormsModule, DatePickerModule],
  templateUrl: './doctor-availability.html',
  styleUrl: './doctor-availability.scss'
})
export class DoctorAvailability {
  selectedDate: string | null = null;
  selectedDateObject: Date = new Date();

  availabilitySlots: AvailabilitySlot[] = [];

  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService
  ) {
    let selectedDate = this.route.snapshot.queryParams['date'];

    if (!selectedDate) {
      selectedDate = this.getFormattedDate();
    }

    this.selectedDate = selectedDate;
    this.selectedDateObject = this.parseDate(selectedDate);

    this.loadSlotsForSelectedDate();
  }

  onDateChanged(date: Date | null) {
    if (date === null) {
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

    this.availabilitySlots = this.doctorservice.getAvailabilitySlotsByDate(this.selectedDate);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  openSlot(slot: AvailabilitySlot) {
    if (this.isEditMode) {
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
    if (slot.status !== 'free') {
      return;
    }

    /*
      Temporary frontend-only logic.
      Later this should call the backend availability endpoint.
    */
    slot.status = 'disabled';
    slot.appointmentId = null;
  }

  enableSlot(slot: AvailabilitySlot) {
    if (slot.status !== 'disabled') {
      return;
    }

    /*
      Temporary frontend-only logic.
      Later this should call the backend availability endpoint.
    */
    slot.status = 'free';
    slot.appointmentId = null;
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
}