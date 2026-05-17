import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Appointment } from '../../../../shared/domain/appointment';
import { DoctorService } from '../../../../shared/services/doctor-service';

@Component({
  selector: 'app-doctor-appointment-details',
  imports: [],
  templateUrl: './doctor-appointment-details.html',
  styleUrl: './doctor-appointment-details.scss'
})
export class DoctorAppointmentDetails {
  appointment: Appointment | undefined;
  returnDate: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService
  ) {
    const appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));
    this.returnDate = this.route.snapshot.queryParams['date'] ?? null;
    this.appointment = this.doctorservice.getAppointmentById(appointmentId);
  }

  get isPendingAppointment(): boolean {
    return this.appointment?.status === 'pending';
  }

  get isRejectedAppointment(): boolean {
    return this.appointment?.status === 'rejected';
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
  goBack() {
    this.router.navigate(['/doctor/appointments'], {
      queryParams: this.returnDate !== null
        ? { date: this.returnDate }
        : {}
    });
  }
}