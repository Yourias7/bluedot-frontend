import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { PatientService } from '../../../shared/services/patient-service';
import { Appointment } from '../../../shared/domain/appointment';

@Component({
  selector: 'app-patient-appointments',
  imports: [TabsModule],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.scss',
})
export class PatientAppointments {

  appointments?: Appointment[]
  constructor(private patientService:PatientService){
    this.appointments = patientService.getAppointments();
    
  }
}
