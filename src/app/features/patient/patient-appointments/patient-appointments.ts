import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

import { Appointment } from '../../../shared/domain/appointment';
import { AppointmentService } from '../../../shared/services/appointment-service';
import { ReviewService } from '../../../shared/services/review-service';

type AppointmentTab = 'appointments' | 'requests' | 'rejected' | 'history';

@Component({
  selector: 'app-patient-appointments',
  imports: [DecimalPipe, DialogModule, FormsModule],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.scss',
})
export class PatientAppointments {
  readonly starPositions = [1, 2, 3, 4, 5];

  selectedTab: AppointmentTab = 'appointments';

  selectedDate: string | null = null;

  allAppointments: Appointment[] = [];

  isLoading = false;
  errorMessage = '';

  reviewDialogVisible = false;
  reviewTargetAppointment: Appointment | null = null;
  reviewRating = 0;
  reviewComment = '';
  isSubmittingReview = false;
  reviewErrorMessage = '';
  reviewedAppointmentIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private reviewService: ReviewService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    const date = this.route.snapshot.queryParams['date'];
    const tab = this.route.snapshot.queryParams['tab'];

    this.selectedDate = date ?? null;

    if (
      tab === 'requests' ||
      tab === 'appointments' ||
      tab === 'rejected' ||
      tab === 'history'
    ) {
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

  get completedAppointments(): Appointment[] {
    return this.allAppointments.filter(appointment => appointment.status === 'completed');
  }

  get visibleAppointments(): Appointment[] {
    if (this.selectedTab === 'appointments') {
      return this.confirmedAppointments;
    }

    if (this.selectedTab === 'requests') {
      return this.pendingRequests;
    }

    if (this.selectedTab === 'rejected') {
      return this.rejectedAppointments;
    }

    return this.completedAppointments;
  }

  selectTab(tab: AppointmentTab): void {
    this.selectedTab = tab;
    this.changeDetectorRef.detectChanges();
  }

  openReviewDialog(appointment: Appointment): void {
    this.reviewTargetAppointment = appointment;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewErrorMessage = '';
    this.reviewDialogVisible = true;
    this.changeDetectorRef.detectChanges();
  }

  closeReviewDialog(): void {
    this.reviewDialogVisible = false;
    this.reviewTargetAppointment = null;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewErrorMessage = '';
    this.isSubmittingReview = false;
    this.changeDetectorRef.detectChanges();
  }

  setReviewRating(rating: number): void {
    this.reviewRating = rating;
    this.changeDetectorRef.detectChanges();
  }

  isStarFilled(star: number): boolean {
    return this.reviewRating >= star;
  }

  isStarHalfFilled(star: number): boolean {
    return this.reviewRating >= star - 0.5 && this.reviewRating < star;
  }

  hasReviewedAppointment(appointmentId: number): boolean {
    return this.reviewedAppointmentIds.has(appointmentId);
  }

  submitReview(): void {
    if (this.reviewTargetAppointment === null) {
      return;
    }

    if (this.reviewRating < 0.5) {
      this.reviewErrorMessage = 'Επιλέξτε βαθμολογία από 0.5 έως 5 αστέρια.';
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.isSubmittingReview = true;
    this.reviewErrorMessage = '';

    this.reviewService
      .submitReview(this.reviewTargetAppointment.id, {
        rating: this.reviewRating,
        comment: this.reviewComment.trim(),
      })
      .subscribe({
        next: () => {
          this.reviewedAppointmentIds.add(this.reviewTargetAppointment!.id);
          this.isSubmittingReview = false;
          this.closeReviewDialog();
        },
        error: error => {
          console.error('Failed to submit review:', error);
          this.isSubmittingReview = false;
          this.reviewErrorMessage = 'Δεν ήταν δυνατή η υποβολή της κριτικής. Δοκιμάστε ξανά.';
          this.changeDetectorRef.detectChanges();
        },
      });
  }
}
