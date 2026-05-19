import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from '../../domain/appointment';
import { DoctorSearchService } from '../../services/doctor-search-service';
import { AppointmentService } from '../../services/appointment-service';
import { Doctor } from '../../domain/doctor';
import { DoctorBasicInfo } from '../doctor-basic-info/doctor-basic-info';

@Component({
  selector: 'app-appointment-details',
  imports: [DoctorBasicInfo],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.scss',
})
export class AppointmentDetails implements OnInit {
  appointment?: Appointment;
  doctor?: Doctor;

  isLoading = false;
  errorMessage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private searchService: DoctorSearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const appointmentId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(appointmentId)) {
      this.router.navigate(['404']);
      return;
    }

    const cachedAppointment = this.appointmentService.getAppointmentById(appointmentId);

    if (cachedAppointment !== undefined) {
      this.appointment = cachedAppointment;
      this.loadDoctor(cachedAppointment.doctorId);
    }

    this.isLoading = true;

    this.appointmentService.loadAppointmentById(appointmentId).subscribe({
      next: appointment => {
        this.appointment = appointment;
        this.isLoading = false;
        this.loadDoctor(appointment.doctorId);
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load appointment details:', error);
        this.isLoading = false;
        this.errorMessage = 'Δεν ήταν δυνατή η φόρτωση των στοιχείων ραντεβού.';

        if (this.appointment === undefined) {
          this.router.navigate(['404']);
        }

        this.cdr.detectChanges();
      }
    });
  }

  private loadDoctor(doctorId: number): void {
    this.searchService.loadDoctorById(doctorId).subscribe({
      next: doctor => {
        this.doctor = doctor;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load doctor for appointment details:', error);
      }
    });
  }
}
