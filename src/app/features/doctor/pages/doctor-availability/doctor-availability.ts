import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorFakeDataService, AvailabilitySlot } from '../../../../shared/services/doctor-fake-data';

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
  private doctorFakeDataService: DoctorFakeDataService
) {
  this.selectedDate = this.route.snapshot.paramMap.get('date');

  this.availabilitySlots = this.doctorFakeDataService.getAvailabilitySlots();
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