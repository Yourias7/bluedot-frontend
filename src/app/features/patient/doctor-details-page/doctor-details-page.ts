import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../shared/services/doctor-service';
import { Doctor } from '../../../shared/domain/doctor';
import { Specialty } from '../../../shared/domain/specialty';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { DoctorAvailabilityPatientSide } from "../doctor-availability-patient-side/doctor-availability-patient-side";

@Component({
  selector: 'app-doctor-details-page',
  imports: [AvatarModule, TabsModule, DoctorAvailabilityPatientSide],
  templateUrl: './doctor-details-page.html',
  styleUrl: './doctor-details-page.scss',
})
export class DoctorDetailsPage {

  userDetailedInfo?: Doctor;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private doctorService: DoctorService) {
    let userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(userId)) {
      this.router.navigate(['404']);
    }
    else {
      // call the backend with the userId to get the user details
      this.userDetailedInfo = this.doctorService.getDoctorById(userId);

      /////test code to be removed when backend is ready
      if (!this.userDetailedInfo) {
        this.router.navigate(['404']);
      }
    }
  }

  review: number = 2;
  getfilledStars(): number {
    return Math.min(Math.max(Math.round(this.review), 1), 5);
  }
}
