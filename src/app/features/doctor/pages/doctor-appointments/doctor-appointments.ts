import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from '../../../../shared/domain/appointment';
import { DoctorService } from '../../../../shared/services/doctor-service';

type AppointmentTab = 'appointments' | 'requests' | 'rejected';

@Component({
  selector: 'app-doctor-appointments',
  imports: [],
  templateUrl: './doctor-appointments.html',
  styleUrl: './doctor-appointments.scss'
})
export class DoctorAppointments {
  selectedTab: AppointmentTab = 'appointments';

  selectedDate: string | null = null;

  allAppointments: Appointment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService
  ) {
    const date = this.route.snapshot.queryParams['date'];

    this.selectedDate = date ?? null;
    this.loadAppointments();
  }

  loadAppointments() {
    /*
      For now, we use the existing mock appointments from DoctorService.
      Later, this method can call the backend through DoctorService
      without changing the template logic.
    */

    if (this.selectedDate !== null) {
      this.allAppointments = this.doctorservice.appointments.filter(
        appointment => appointment.date === this.selectedDate
      );

      return;
    }

    this.allAppointments = this.doctorservice.appointments;
  }

  get confirmedAppointments(): Appointment[] {
    return this.allAppointments.filter(appointment =>
      appointment.status === 'booked'
    );
  }

  get pendingRequests(): Appointment[] {
    return this.allAppointments.filter(appointment =>
      appointment.status === 'pending'
    );
  }

  get visibleAppointments(): Appointment[] {
    if (this.selectedTab === 'appointments') {
      return this.confirmedAppointments;
    }

    if (this.selectedTab === 'requests') {
      return this.pendingRequests;
    }

    return this.rejectedAppointments;
  }

  get rejectedAppointments(): Appointment[] {
    return this.allAppointments.filter(appointment =>
      appointment.status === 'rejected'
    );
  }

  selectTab(tab: AppointmentTab) {
    this.selectedTab = tab;
  }

  openAppointment(appointment: Appointment) {
  this.router.navigate(['/doctor/appointments', appointment.id], {
    queryParams: this.selectedDate !== null
      ? { date: this.selectedDate }
      : {}
  });
}
}