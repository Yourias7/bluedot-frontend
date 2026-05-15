import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Doctor } from '../../../shared/domain/doctor';
import { DoctorResultCard } from "./components/doctor-result-card/doctor-result-card";
import { DoctorService } from '../../../shared/services/doctor-service';
import { Router } from '@angular/router';
import { DoctorDetailsPage } from '../doctor-details-page/doctor-details-page';

@Component({
  selector: 'app-doctor-result-page',
  imports: [AvatarModule, DoctorResultCard],
  templateUrl: './doctor-result-page.html',
  styleUrl: './doctor-result-page.scss',
})
export class DoctorResultPage {

  doctors?: Doctor[];
  constructor(doctorService: DoctorService, private router: Router) {
    this.doctors = doctorService.getDoctors();
  }

  onCardClicked(id?: number) {
    console.log("lmaoooo");
    this.router.navigate(['/doctor-details', id]);
  }
}
