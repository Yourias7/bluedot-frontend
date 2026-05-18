import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { PatientService } from '../../../shared/services/patient-service';
import { Appointment } from '../../../shared/domain/appointment';
import { AppointmentCard } from '../../../shared/components/appointment-card/appointment-card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-appointments',
  imports: [TabsModule, AppointmentCard],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.scss',
})
export class PatientAppointments implements OnInit {
  appointments?: Appointment[];

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {
    this.appointments = this.patientService.getAppointments();
  }

  ngOnInit(): void {}

  getCurrentAppointment(): Appointment[] | undefined {
    return this.appointments?.filter(appointment => appointment.status === 'booked');
  }

  getCurrentAppointmentCount(): number {
    if (!this.appointments) {
      return 0;
    }

    return this.appointments.filter(appointment => appointment.status === 'booked').length;
  }

  getPendingAppointment(): Appointment[] | undefined {
    return this.appointments?.filter(appointment => appointment.status === 'pending');
  }

  getPendingAppointmentCount(): number {
    if (!this.appointments) {
      return 0;
    }

    return this.appointments.filter(appointment => appointment.status === 'pending').length;
  }

  getCompletedAppointment(): Appointment[] | undefined {
    return this.appointments?.filter(appointment => appointment.status === 'rejected');
  }

  getCompletedAppointmentCount(): number {
    if (!this.appointments) {
      return 0;
    }

    return this.appointments.filter(appointment => appointment.status === 'rejected').length;
  }

  showAppointmentDetails(id: number) {
    this.router.navigate(['/patient-appointments', id]);
  }
}