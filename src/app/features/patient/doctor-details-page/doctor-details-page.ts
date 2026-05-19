import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';

import { Doctor } from '../../../shared/domain/doctor';
import { AvailabilitySlot } from '../../../shared/domain/availability-slot';
import { DoctorAvailabilityPatientSide, PatientSlotSelection } from '../doctor-availability-patient-side/doctor-availability-patient-side';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';

@Component({
  selector: 'app-doctor-details-page',
  imports: [AvatarModule, TabsModule, DoctorAvailabilityPatientSide],
  templateUrl: './doctor-details-page.html',
  styleUrl: './doctor-details-page.scss',
})
export class DoctorDetailsPage {
  userDetailedInfo?: Doctor;

  selectedBookingDate: string | null = null;
  selectedBookingSlot: AvailabilitySlot | null = null;

  review = 2;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorSearchService
  ) {
    const userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(userId)) {
      this.router.navigate(['404']);
      return;
    }

    const doctorResult = this.doctorService.getDoctors();

    this.userDetailedInfo = Array.isArray(doctorResult)
      ? doctorResult.find(doctor => doctor.id === userId)
      : doctorResult;

    if (!this.userDetailedInfo) {
      this.router.navigate(['404']);
    }
  }

  getfilledStars(): number {
    return Math.min(Math.max(Math.round(this.review), 1), 5);
  }

  onBookingSlotChanged(selection: PatientSlotSelection) {
    this.selectedBookingDate = selection.date;
    this.selectedBookingSlot = selection.slot;
  }

  closeAppointment(id: number) {
    if (this.selectedBookingSlot === null || this.selectedBookingDate === null) {
      return;
    }

    this.router.navigate(['/book-appointment', id], {
      queryParams: {
        date: this.selectedBookingDate,
        slotId: this.selectedBookingSlot.id,
        startTime: this.selectedBookingSlot.startTime,
        endTime: this.selectedBookingSlot.endTime
      }
    });
  }
}