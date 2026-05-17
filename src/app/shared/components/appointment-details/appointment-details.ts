import { Component } from '@angular/core';
import { Appointment } from '../../domain/appointment';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { DoctorSearchService } from '../../services/doctor-search-service';
import { PatientService } from '../../services/patient-service';

@Component({
  selector: 'app-appointment-details',
  imports: [],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.scss',
})
export class AppointmentDetails {
  appointment?: Appointment;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private patientService: PatientService) {
    let userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(userId)) {
      this.router.navigate(['404']);
    }
    else {
      // call the backend with the userId to get the user details
      this.appointment = this.patientService.getAppointmentById(userId);
      console.log(this.appointment?.id);
      /////test code to be removed when backend is ready
     if (!this.appointment) {
        this.router.navigate(['404']);
      } 
    }
  }
}
