import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../../shared/services/doctor-service';
import { Appointment } from '../../../../shared/domain/appointment';

@Component({
  selector: 'app-doctor-appointment-details',
  imports: [],
  templateUrl: './doctor-appointment-details.html',
  styleUrl: './doctor-appointment-details.scss'
})
export class DoctorAppointmentDetails {
  appointmentId: string | null = null;
  appointment: Appointment | undefined;
  backendMessage: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService
  ) {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId');

    const numericAppointmentId = Number(this.appointmentId);

    this.appointment = this.doctorservice.getAppointmentById(
      numericAppointmentId
    );
  }

  goBack() {
    this.router.navigate(['/doctor']);
  }

  acceptAppointment() {
    if (this.appointment) {
      this.doctorservice.acceptAppointment(this.appointment.id)?.subscribe(() => {
        this.backendMessage = 'Appointment accepted successfully.';
      });
    }
  }

  rejectAppointment() {
    if (this.appointment) {
      this.doctorservice.rejectAppointment(this.appointment.id)?.subscribe(() => {
        this.backendMessage = 'Appointment rejected successfully.';
      });
    }
  }

  rejectAppointmentAndDisableSlot() {
    if (this.appointment) {
      this.doctorservice.rejectAppointmentAndDisableSlot(this.appointment.id).subscribe(() => {
        this.backendMessage = 'Appointment rejected and slot disabled successfully.';
      });
    }
  }
}