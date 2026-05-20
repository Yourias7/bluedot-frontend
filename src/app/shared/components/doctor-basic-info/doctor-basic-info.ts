// Displays a doctor's avatar and basic profile info (name, specialty, rating)
import { Component, Input } from '@angular/core';
import { Doctor } from '../../../shared/domain/doctor';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-doctor-basic-info',
  imports: [AvatarModule],
  templateUrl: './doctor-basic-info.html',
  styleUrl: './doctor-basic-info.scss',
})
export class DoctorBasicInfo {
  @Input() userDetailedInfo!: Doctor;

  review: number = 2; // TODO: replace with real rating from the backend
  getfilledStars(): number {
    // clamps the rounded rating to the valid 1–5 star range
    return Math.min(Math.max(Math.round(this.review), 1), 5);
  }
}
