import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { Doctor } from '../../../shared/domain/doctor';
import { AppointmentService } from '../../../shared/services/appointment-service';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
@Component({
  selector: 'app-appointment-confirm',
  imports: [CommonModule, AvatarModule, ReactiveFormsModule],
  templateUrl: './appointment-confirm.html',
  styleUrl: './appointment-confirm.scss',
})
export class AppointmentConfirm implements OnInit {
  readonly starPositions = [1, 2, 3, 4, 5];

  userDetailedInfo?: Doctor;
  doctorId: number | null = null;
  selectedDate: string | null = null;
  selectedSlotId: number | null = null;
  startTime: string | null = null;
  endTime: string | null = null;

  visitReason = new FormControl('', [Validators.required, Validators.minLength(10)]);

  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorSearchService,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const doctorId = Number(queryParams['doctorId']);

    if (Number.isNaN(doctorId)) {
      this.router.navigate(['404']);
      return;
    }

    this.doctorId = doctorId;
    this.selectedDate = queryParams['date'] ?? null;

    const slotId = Number(queryParams['slotId']);
    this.selectedSlotId = Number.isNaN(slotId) ? null : slotId;
    this.startTime = queryParams['startTime'] ?? null;
    this.endTime = queryParams['endTime'] ?? null;

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

  goBack(): void {
    if (this.doctorId === null) {
      return;
    }

    const queryParams: Record<string, string> = {};

    if (this.selectedDate) {
      queryParams['date'] = this.selectedDate;
    }

    this.router.navigate(['/doctor-details', this.doctorId], { queryParams });
  }

  confirmAppointment(): void {
    this.visitReason.markAsTouched();
    this.submitError = null;

    if (this.visitReason.invalid || this.doctorId === null) {
      return;
    }

    if (this.selectedSlotId === null) {
      this.submitError = 'Δεν έχει επιλεγεί διαθέσιμο ραντεβού.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.appointmentService
      .requestAppointment({
        doctorId: this.doctorId,
        availabilityId: this.selectedSlotId,
        appointmentNotes: this.visitReason.value?.trim() ?? ''
      })
      .subscribe({
        next: () => {
          const appointmentNotes = this.visitReason.value?.trim() ?? '';
          this.isSubmitting = false;
          this.router.navigate(['/appointment-confirm-end'], {
            queryParams: {
              doctorId: this.doctorId,
              date: this.selectedDate,
              slotId: this.selectedSlotId,
              startTime: this.startTime,
              endTime: this.endTime
            },
            state: { appointmentNotes }
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to create appointment request:', error);
          this.isSubmitting = false;
          this.submitError = this.resolveSubmitError(error);
          this.cdr.detectChanges();
        }
      });
  }

  private resolveSubmitError(error: HttpErrorResponse): string {
    const body = error.error;

    if (typeof body === 'string' && body.length > 0) {
      return body;
    }

    if (body && typeof body === 'object') {
      const message = body.message ?? body.title ?? body.detail;

      if (typeof message === 'string' && message.length > 0) {
        return message;
      }
    }

    if (error.status === 401 || error.status === 403) {
      return 'Πρέπει να συνδεθείτε ως ασθενής για να υποβάλετε αίτημα ραντεβού.';
    }

    return 'Αποτυχία αποστολής αιτήματος ραντεβού. Δοκιμάστε ξανά.';
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
