import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Appointment } from '../../../shared/domain/appointment';
import { AppointmentService } from '../../../shared/services/appointment-service';

type DashboardMetric = {
  label: string;
  value: number;
  helper: string;
  icon: string;
};

type StatusStat = {
  label: string;
  value: number;
  percent: number;
};

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  appointments: Appointment[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private appointmentService: AppointmentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get totalAppointments(): number {
    return this.appointments.length;
  }

  get pendingAppointments(): Appointment[] {
    return this.appointments.filter(appointment => appointment.status === 'pending');
  }

  get confirmedAppointments(): Appointment[] {
    return this.appointments.filter(appointment => appointment.status === 'booked');
  }

  get completedAppointments(): Appointment[] {
    return this.appointments.filter(appointment => appointment.status === 'completed');
  }

  get rejectedAppointments(): Appointment[] {
    return this.appointments.filter(appointment => appointment.status === 'rejected');
  }

  get totalDoctors(): number {
    const doctorIds = this.appointments
      .map(appointment => appointment.doctorId)
      .filter(id => id !== null && id !== undefined);

    return new Set(doctorIds).size;
  }

  get totalPatients(): number {
    const patientNames = this.appointments
      .map(appointment => appointment.patientName)
      .filter(name => name && name !== '-');

    return new Set(patientNames).size;
  }

  get dashboardMetrics(): DashboardMetric[] {
    return [
      {
        label: 'Σύνολο ραντεβού',
        value: this.totalAppointments,
        helper: 'Όλα τα αιτήματα και ραντεβού',
        icon: '📅'
      },
      {
        label: 'Εκκρεμή αιτήματα',
        value: this.pendingAppointments.length,
        helper: 'Χρειάζονται απάντηση από γιατρό',
        icon: '⏳'
      },
      {
        label: 'Ενεργοί γιατροί',
        value: this.totalDoctors,
        helper: 'Με βάση τα υπάρχοντα ραντεβού',
        icon: '🩺'
      },
      {
        label: 'Ασθενείς',
        value: this.totalPatients,
        helper: 'Με βάση τα υπάρχοντα ραντεβού',
        icon: '👤'
      }
    ];
  }

  get statusStats(): StatusStat[] {
    return [
      {
        label: 'Σε αναμονή',
        value: this.pendingAppointments.length,
        percent: this.getPercent(this.pendingAppointments.length)
      },
      {
        label: 'Επιβεβαιωμένα',
        value: this.confirmedAppointments.length,
        percent: this.getPercent(this.confirmedAppointments.length)
      },
      {
        label: 'Ολοκληρωμένα',
        value: this.completedAppointments.length,
        percent: this.getPercent(this.completedAppointments.length)
      },
      {
        label: 'Απορριφθέντα',
        value: this.rejectedAppointments.length,
        percent: this.getPercent(this.rejectedAppointments.length)
      }
    ];
  }

  get recentAppointments(): Appointment[] {
    return [...this.appointments]
      .sort((a, b) => {
        const firstDate = this.getAppointmentSortDate(a).getTime();
        const secondDate = this.getAppointmentSortDate(b).getTime();

        return secondDate - firstDate;
      })
      .slice(0, 6);
  }

  get completionRate(): number {
    if (this.totalAppointments === 0) {
      return 0;
    }

    return Math.round((this.completedAppointments.length / this.totalAppointments) * 100);
  }

  get pendingRate(): number {
    if (this.totalAppointments === 0) {
      return 0;
    }

    return Math.round((this.pendingAppointments.length / this.totalAppointments) * 100);
  }

  get dashboardSubtitle(): string {
    if (this.totalAppointments === 0) {
      return 'Δεν υπάρχουν ακόμη δεδομένα ραντεβού.';
    }

    return `Παρακολούθηση ${this.totalAppointments} ραντεβού στην πλατφόρμα.`;
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.loadAppointments().subscribe({
      next: appointments => {
        this.appointments = appointments;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: error => {
        console.error('Could not load admin dashboard data:', error);

        this.appointments = [];
        this.isLoading = false;
        this.errorMessage = 'Δεν ήταν δυνατή η φόρτωση των στοιχείων του dashboard.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getStatusLabel(appointment: Appointment): string {
    if (appointment.status === 'pending') {
      return 'Σε αναμονή';
    }

    if (appointment.status === 'booked') {
      return 'Επιβεβαιωμένο';
    }

    if (appointment.status === 'completed') {
      return 'Ολοκληρωμένο';
    }

    return 'Απορρίφθηκε';
  }

  private getPercent(value: number): number {
    if (this.totalAppointments === 0) {
      return 0;
    }

    return Math.round((value / this.totalAppointments) * 100);
  }

  private getAppointmentSortDate(appointment: Appointment): Date {
    const [year, month, day] = appointment.date.split('-').map(Number);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }
}