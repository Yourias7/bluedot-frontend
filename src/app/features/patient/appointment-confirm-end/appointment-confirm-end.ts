import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { Doctor } from '../../../shared/domain/doctor';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';

@Component({
  selector: 'app-appointment-confirm-end',
  imports: [CommonModule, AvatarModule],
  templateUrl: './appointment-confirm-end.html',
  styleUrl: './appointment-confirm-end.scss',
})
export class AppointmentConfirmEnd implements OnInit {
  readonly starPositions = [1, 2, 3, 4, 5];

  userDetailedInfo?: Doctor;
  patientNotes = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorSearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const doctorId = Number(queryParams['doctorId']);

    if (Number.isNaN(doctorId)) {
      this.router.navigate(['404']);
      return;
    }

    this.patientNotes = this.readAppointmentNotes();

    this.loadDoctor(doctorId);
  }

  get rating(): number {
    return this.userDetailedInfo?.averageRating ?? 0;
  }

  get reviewCount(): number {
    return this.userDetailedInfo?.reviewCount ?? 0;
  }

  getFilledStars(): number {
    return Math.min(Math.max(Math.round(this.rating), 0), 5);
  }

  viewAppointments(): void {
    this.router.navigate(['/patient-appointments']);
  }

  goToLandingPage(): void {
    this.router.navigate(['/landing-page']);
  }

  private readAppointmentNotes(): string {
    const historyState = history.state as { appointmentNotes?: string } | undefined;
    const fromState = historyState?.appointmentNotes;

    if (typeof fromState === 'string' && fromState.length > 0) {
      return fromState;
    }

    const fromQuery = this.activatedRoute.snapshot.queryParams['reason'];

    return typeof fromQuery === 'string' ? fromQuery : '';
  }

  private loadDoctor(id: number): void {
    this.doctorService.loadDoctorById(id).subscribe({
      next: (doctor) => {
        this.userDetailedInfo = doctor;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load doctor details:', error);
        this.router.navigate(['404']);
      }
    });
  }
}
