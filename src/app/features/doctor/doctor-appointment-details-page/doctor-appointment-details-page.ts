import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorFakeDataService, Appointment } from '../services/doctor-fake-data';

@Component({
  selector: 'app-doctor-appointment-details-page',
  imports: [],
  templateUrl: './doctor-appointment-details-page.html',
  styleUrl: './doctor-appointment-details-page.scss'
})
export class DoctorAppointmentDetailsPage {
  appointmentId: string | null = null;
  appointment: Appointment | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorFakeDataService: DoctorFakeDataService
  ) {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId');

    const numericAppointmentId = Number(this.appointmentId);

    this.appointment = this.doctorFakeDataService.getAppointmentById(
      numericAppointmentId
    );
  }

  goBack() {
    this.router.navigate(['/doctor']);
  }

  acceptAppointment() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorFakeDataService.acceptAppointment(this.appointment.id);
  }

  rejectAppointment() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorFakeDataService.rejectAppointment(this.appointment.id);
  }

  rejectAppointmentAndDisableSlot() {
    if (this.appointment === undefined) {
      return;
    }

    this.doctorFakeDataService.rejectAppointmentAndDisableSlot(this.appointment.id);
  }
}