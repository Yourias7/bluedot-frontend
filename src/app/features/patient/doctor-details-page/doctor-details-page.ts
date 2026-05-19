import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { Doctor } from '../../../shared/domain/doctor';
import { Review } from '../../../shared/domain/review';
import { AvailabilitySlot } from '../../../shared/domain/availability-slot';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import {
  DoctorAvailabilityPatientSide,
  PatientSlotSelection
} from '../doctor-availability-patient-side/doctor-availability-patient-side';

@Component({
  selector: 'app-doctor-details-page',
  imports: [CommonModule, AvatarModule, TabsModule, DoctorAvailabilityPatientSide],
  templateUrl: './doctor-details-page.html',
  styleUrl: './doctor-details-page.scss',
})
export class DoctorDetailsPage implements OnInit {

  readonly starPositions = [1, 2, 3, 4, 5];

  userDetailedInfo?: Doctor;
  reviews: Review[] = [];

  loadError: string | null = null;
  reviewsError: string | null = null;
  reviewsLoaded = false;

  doctorId: number | null = null;

  selectedSlot: AvailabilitySlot | null = null;
  selectedDate: string | null = null;

  slotErrorMessage: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorSearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(userId)) {
      this.router.navigate(['404']);
      return;
    }

    this.doctorId = userId;

    const dateFromQuery = this.activatedRoute.snapshot.queryParams['date'];

    if (typeof dateFromQuery === 'string' && dateFromQuery.length > 0) {
      this.selectedDate = dateFromQuery;
    }

    this.loadDoctor(userId);
    this.loadReviews(userId);
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

  getReviewFilledStars(rating: number): number {
    return Math.min(Math.max(Math.round(rating ?? 0), 0), 5);
  }

  closeAppointment() {
    if (this.selectedSlot === null || this.selectedDate === null) {
      this.slotErrorMessage = 'Δεν έχετε επιλέξει διαθέσιμο ραντεβού';
      return;
    }

    if (this.doctorId === null) {
      return;
    }

    this.slotErrorMessage = null;

    this.router.navigate(['/appointment-confirmation'], {
      queryParams: {
        doctorId: this.doctorId,
        date: this.selectedDate,
        slotId: this.selectedSlot.id,
        startTime: this.selectedSlot.startTime,
        endTime: this.selectedSlot.endTime
      }
    });
  }

  onSlotPicked(selection: PatientSlotSelection) {
    this.selectedSlot = selection.slot;
    this.selectedDate = selection.date;
    this.slotErrorMessage = null;
  }

  private loadDoctor(id: number) {
    this.doctorService.loadDoctorById(id).subscribe({
      next: (doctor) => {
        this.userDetailedInfo = doctor;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load doctor details:', error);
        this.loadError = 'Αποτυχία φόρτωσης στοιχείων ιατρού.';
        this.router.navigate(['404']);
      }
    });
  }

  private loadReviews(id: number) {
    this.doctorService.loadReviewsByDoctorId(id).subscribe({
      next: (reviews) => {
        this.reviews = reviews ?? [];
        this.reviewsLoaded = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load doctor reviews:', error);
        this.reviewsError = 'Αποτυχία φόρτωσης αξιολογήσεων.';
        this.reviewsLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }
}