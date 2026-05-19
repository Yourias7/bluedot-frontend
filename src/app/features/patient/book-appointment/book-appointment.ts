import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';

import { Doctor } from '../../../shared/domain/doctor';
import { AvailabilitySlot } from '../../../shared/domain/availability-slot';
import { DoctorAvailabilityPatientSide, PatientSlotSelection } from '../doctor-availability-patient-side/doctor-availability-patient-side';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { DoctorBasicInfo } from '../../../shared/components/doctor-basic-info/doctor-basic-info';

@Component({
  selector: 'app-book-appointment',
  imports: [AvatarModule, DoctorAvailabilityPatientSide, ReactiveFormsModule, FormsModule, DoctorBasicInfo],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})
export class BookAppointment {
  userDetailedInfo?: Doctor;

  appointmentForm: FormGroup;

  closedSlot: AvailabilitySlot | null = null;

  selectedDate: string | null = null;
  selectedSlotId: number | null = null;

  errorMessage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorSearchService
  ) {
    const userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(userId)) {
      this.router.navigate(['404']);
    } else {
      this.userDetailedInfo = this.doctorService.getDoctorById(userId);

      if (!this.userDetailedInfo) {
        this.router.navigate(['404']);
      }
    }

    this.selectedDate = this.activatedRoute.snapshot.queryParams['date'] ?? null;

    const slotIdParam = Number(this.activatedRoute.snapshot.queryParams['slotId']);
    this.selectedSlotId = Number.isNaN(slotIdParam) ? null : slotIdParam;

    const startTime = this.activatedRoute.snapshot.queryParams['startTime'];
    const endTime = this.activatedRoute.snapshot.queryParams['endTime'];

    if (this.selectedSlotId !== null && startTime && endTime) {
      this.closedSlot = {
        id: this.selectedSlotId,
        startTime: startTime,
        endTime: endTime,
        status: 'free',
        appointmentId: null
      };
    }

    this.appointmentForm = new FormGroup({
      reason: new FormControl('', [Validators.required, Validators.minLength(10)]),
      doctorId: new FormControl(this.userDetailedInfo?.id, Validators.required),
      slotId: new FormControl(this.selectedSlotId, Validators.required),
      date: new FormControl(this.selectedDate, Validators.required)
    });
  }

  onSlotSelectionChanged(selection: PatientSlotSelection) {
    this.selectedDate = selection.date;
    this.closedSlot = selection.slot;
    this.selectedSlotId = selection.slot.id;

    this.appointmentForm.patchValue({
      slotId: selection.slot.id,
      date: selection.date
    });
  }

  goBack() {
    this.router.navigate(['/doctor-details', this.userDetailedInfo?.id]);
  }

  submitAppointment() {
    this.errorMessage = '';
    this.appointmentForm.markAllAsTouched();

    if (this.appointmentForm.invalid || this.closedSlot === null) {
      this.errorMessage = 'Συμπληρώστε τον λόγο επίσκεψης και επιλέξτε διαθέσιμη ώρα.';
      return;
    }

    const appointmentData = {
      ...this.appointmentForm.value,
      startTime: this.closedSlot.startTime,
      endTime: this.closedSlot.endTime
    };

    console.log('Appointment Data:', appointmentData);

    this.router.navigate(['/appointment-confirmation']);
  }
}