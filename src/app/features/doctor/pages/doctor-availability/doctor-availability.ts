import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

import { AvailabilitySlot } from '../../../../shared/domain/availability-slot';
import { DoctorService } from '../../../../shared/services/doctor-service';

type UserRole = 'patient' | 'doctor' | 'manager';

@Component({
  selector: 'app-doctor-availability',
  imports: [FormsModule, DatePickerModule],
  templateUrl: './doctor-availability.html',
  styleUrl: './doctor-availability.scss'
})
export class DoctorAvailability {
  selectedDate: string | null = null;
  selectedDateObject: Date = new Date();

  /*
    TEMPORARY TESTING ROLE.

    Later this should NOT be hardcoded.
    Later we should read the user role from the JWT claims,
    probably through an AuthService.
  */
  fakeUserRole: UserRole = 'doctor';

  availabilitySlots: AvailabilitySlot[] = [];

  selectedSlot: AvailabilitySlot | null = null;
  showSlotMenu = false;
  menuX = 0;
  menuY = 0;

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

    console.log('Selected date:', selectedDate);

    this.loadSlotsForSelectedDate();
  }

  onDateChanged(date: Date | null) {
    console.log('Date clicked:', date);

    if (date === null) {
      return;
    }

    this.selectedDateObject = date;
    this.selectedDate = this.formatDate(date);

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

  openSlot(slot: AvailabilitySlot) {
    if (slot.appointmentId !== null) {
      this.router.navigate(['/doctor/appointments', slot.appointmentId]);
    }
  }

  openSlotMenu(event: MouseEvent, slot: AvailabilitySlot) {
    event.preventDefault();

    if (this.fakeUserRole !== 'doctor') {
      return;
    }

    if (slot.status !== 'free' && slot.status !== 'disabled') {
      return;
    }

    this.selectedSlot = slot;
    this.showSlotMenu = true;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
  }

  closeSlotMenu() {
    this.showSlotMenu = false;
    this.selectedSlot = null;
  }

  disableSlot() {
    if (this.selectedSlot === null) {
      return;
    }

    /*
      TEMPORARY FRONTEND-ONLY LOGIC.

      Later this should call the backend.
      For now, it only updates the selected slot visually.
    */
    this.selectedSlot.status = 'disabled';
    this.closeSlotMenu();
  }

  enableSlot() {
    if (this.selectedSlot === null) {
      return;
    }

    /*
      TEMPORARY FRONTEND-ONLY LOGIC.

      Later this should call the backend.
      For now, it only updates the selected slot visually.
    */
    this.selectedSlot.status = 'free';
    this.closeSlotMenu();
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