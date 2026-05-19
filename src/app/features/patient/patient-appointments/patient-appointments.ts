import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Appointment } from '../../../shared/domain/appointment';
import { AppointmentService } from '../../../shared/services/appointment-service';

type AppointmentTab = 'appointments' | 'requests' | 'rejected';

@Component({
  selector: 'app-patient-appointments',
  imports: [],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.scss',
})
export class PatientAppointments {
  selectedTab: AppointmentTab = 'appointments';

  selectedDate: string | null = null;

  allAppointments: Appointment[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    const date = this.route.snapshot.queryParams['date'];
    const tab = this.route.snapshot.queryParams['tab'];

    this.selectedDate = date ?? null;

    if (tab === 'requests' || tab === 'appointments' || tab === 'rejected') {
      this.selectedTab = tab;
    }

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.loadAppointments().subscribe({
      next: () => {
        if (this.selectedDate !== null) {
          this.allAppointments = this.appointmentService.getAppointmentsByDate(this.selectedDate);
        } else {
          this.allAppointments = this.appointmentService.getAppointments();
        }

        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: error => {
        console.error('Could not load patient appointments:', error);

        this.isLoading = false;
        this.errorMessage = 'Δεν ήταν δυνατή η φόρτωση των ραντεβού.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  get confirmedAppointments(): Appointment[] {
    return this.allAppointments.filter(appointment => appointment.status === 'booked');
  }

  get pendingRequests(): Appointment[] {
    return this.allAppointments.filter(appointment => appointment.status === 'pending');
  }

  get rejectedAppointments(): Appointment[] {
    return this.allAppointments.filter(appointment => appointment.status === 'rejected');
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

  selectTab(tab: AppointmentTab): void {
    this.selectedTab = tab;
    this.changeDetectorRef.detectChanges();
  }

  openAppointment(appointment: Appointment): void {
    this.router.navigate(['/patient-appointments', appointment.id], {
      queryParams: this.selectedDate !== null ? { date: this.selectedDate } : {}
    });
  }
}
