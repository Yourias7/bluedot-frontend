import { Component } from '@angular/core';
import { Doctor } from '../../../shared/domain/doctor';
import { ActivatedRoute, Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { DoctorBasicInfo } from "../../../shared/components/doctor-basic-info/doctor-basic-info";
import { DoctorAvailabilityPatientSide } from "../doctor-availability-patient-side/doctor-availability-patient-side";

@Component({
  selector: 'app-appointment-confirm',
  imports: [AvatarModule, DoctorBasicInfo,],
  templateUrl: './appointment-confirm.html',
  styleUrl: './appointment-confirm.scss',
})
export class AppointmentConfirm {
  userDetailedInfo!: Doctor;

  constructor(){
    
  }
}
