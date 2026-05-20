// Service for submitting post-appointment reviews; reviews are scoped to a specific appointment
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Review } from '../domain/review';

export type CreateReviewRequestDto = {
  rating: number;  // 1–5 star rating
  comment: string;
};

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  submitReview(appointmentId: number, dto: CreateReviewRequestDto): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/appointments/${appointmentId}/review`, dto);
  }
}
