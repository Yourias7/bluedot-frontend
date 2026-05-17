import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Doctor } from '../../../shared/domain/doctor';
import { DoctorAvailabilityPatientSide } from "../doctor-availability-patient-side/doctor-availability-patient-side";
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { AvailabilitySlot } from '../../../shared/domain/availability-slot';
import { DoctorBasicInfo } from '../../../shared/components/doctor-basic-info/doctor-basic-info';
import { Appointment } from '../../../shared/domain/appointment';
import { AppointmentStatus } from '../../../shared/domain/appointment-status';
import { App } from '../../../app';

@Component({
  selector: 'app-book-appointment',
  imports: [AvatarModule, DoctorAvailabilityPatientSide, ReactiveFormsModule, FormsModule, DoctorBasicInfo],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})

export class BookAppointment {
  userDetailedInfo?: Doctor
  appointmentForm!: FormGroup;
  closedSlot!: AvailabilitySlot;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private doctorService: DoctorSearchService) {
    let userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(userId)) {
      this.router.navigate(['404']);
    }
    else {
      // call the backend with the userId to get the user details
      this.userDetailedInfo = this.doctorService.getDoctorById(userId);

      /////test code to be removed when backend is ready
      if (!this.userDetailedInfo) {
        this.router.navigate(['404']);
      }
    }

    this.appointmentForm = new FormGroup({
      reason: new FormControl('', [Validators.required, Validators.minLength(10)]),
      doctorId: new FormControl(this.userDetailedInfo?.id, Validators.required),
      slotId: new FormControl(this.closedSlot?.id, Validators.required)
    });
  }



  goBack() {
    this.router.navigate(['/doctor-details', this.userDetailedInfo?.id]);
  }

  submitAppointment() {
    if (this.appointmentForm.valid) {
      const appointmentData = this.appointmentForm.value;
      console.log('Appointment Data:', appointmentData);
      // call the backend to save the appointment data
      this.router.navigate(['/appointment-confirmation']);
    }
  }
}
