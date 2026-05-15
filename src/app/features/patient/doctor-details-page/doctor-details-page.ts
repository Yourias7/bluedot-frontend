import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../shared/services/doctor-service';
import { Doctor } from '../../../shared/domain/doctor';

@Component({
  selector: 'app-doctor-details-page',
  imports: [],
  templateUrl: './doctor-details-page.html',
  styleUrl: './doctor-details-page.scss',
})
export class DoctorDetailsPage {

  userDetailedInfo?: Doctor;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private doctorService: DoctorService) {
    let userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if(Number.isNaN(userId)){
      this.router.navigate(['404']);
    } 
    else {
      // call the backend with the userId to get the user details
      const doctorResult = this.doctorService.getDoctors();
      this.userDetailedInfo = Array.isArray(doctorResult)
        ? doctorResult.find(doctor => doctor.id === userId)
        : doctorResult;

      /////test code to be removed when backend is ready
      if(!this.userDetailedInfo){
        this.router.navigate(['404']);
      }
    }
  }
}
