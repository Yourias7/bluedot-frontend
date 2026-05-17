import { Component } from '@angular/core';
import { Appointment } from '../../domain/appointment';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorSearchService } from '../../services/doctor-search-service';
import { PatientService } from '../../services/patient-service';
import { Doctor } from '../../domain/doctor';
import { DoctorBasicInfo } from '../doctor-basic-info/doctor-basic-info';

@Component({
  selector: 'app-appointment-details',
  imports: [DoctorBasicInfo],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.scss',
})
export class AppointmentDetails {
  appointment?: Appointment;
  doctor!:Doctor;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private patientService: PatientService, private searchService:DoctorSearchService) {
    let userId = Number(this.activatedRoute.snapshot.paramMap.get('appointmentId'));

    if (Number.isNaN(userId)) {
      this.router.navigate(['404']);

    }
    else {
      // call the backend with the userId to get the user details
      this.appointment = this.patientService.getAppointmentById(userId);
     /// console.log(userId);
     
      /////test code to be removed when backend is ready
      if (!this.appointment) {
        this.router.navigate(['404']);
      }
      else{
        let _doc = this.searchService.getDoctorById(1);
        if(_doc) {
          //console.log(this.appointment.doctorId);
          this.doctor = _doc;
        }
      }
    }
  }
}
