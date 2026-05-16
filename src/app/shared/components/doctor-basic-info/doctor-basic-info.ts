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

  review: number = 2;
  getfilledStars(): number {
    return Math.min(Math.max(Math.round(this.review), 1), 5);
  }
}
