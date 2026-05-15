import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AvailabilitySlot } from '../../../../shared/domain/availability-slot';
import { DoctorService } from '../../../../shared/services/doctor-service';

type UserRole = 'patient' | 'doctor' | 'manager';

@Component({
  selector: 'app-doctor-availability',
  imports: [],
  templateUrl: './doctor-availability.html',
  styleUrl: './doctor-availability.scss'
})
export class DoctorAvailability {
  selectedDate: string | null = null;

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
    console.log('Selected date:', selectedDate);
    this.availabilitySlots = this.doctorservice.getAvailabilitySlots();
  }
  openSlot(slot: AvailabilitySlot) {
    if (slot.appointmentId !== null) {
      this.router.navigate(['/doctor/appointments', slot.appointmentId]);
    }
  }
  getFormattedDate(): string  {
    const date = new Date();

    const year = date.getFullYear();
    // Adding 1 because getMonth() is 0-indexed
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Pad with leading zeros if you want consistent 2-digit lengths (e.g., 04 instead of 4)
    const format = (num: number) => num.toString().padStart(2, '0');

    return `${year}/${format(month)}/${format(day)}`;
  };
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

      Later this should call the backend, for example:
      PATCH /api/availabilities/{availabilityId}/disable

      The backend should verify that:
      - the logged-in user is a doctor
      - this availability slot belongs to that doctor
      - the slot is not already booked or pending
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
  
      Later this should call the backend, for example:
      PATCH /api/availabilities/{availabilityId}/enable
  
      The backend should verify that:
      - the logged-in user is a doctor
      - this availability slot belongs to that doctor
      - the slot is currently disabled
    */
    this.selectedSlot.status = 'free';
    this.closeSlotMenu();
  }
}