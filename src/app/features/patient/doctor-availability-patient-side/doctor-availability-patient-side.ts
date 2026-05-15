import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorFakeDataService, AvailabilitySlot } from './../../doctor/services/doctor-fake-data';

@Component({
  selector: 'app-doctor-availability-patient-side',
  imports: [],
  templateUrl: './doctor-availability-patient-side.html',
  styleUrl: './doctor-availability-patient-side.scss',
})
export class DoctorAvailabilityPatientSide {
  availabilitySlots: AvailabilitySlot[] = [];
  selectedDate: string | null = null;
  selectedSlot: AvailabilitySlot | null = null;
  showSlotMenu = false;
  menuX = 0;
  menuY = 0;

  constructor(private route: ActivatedRoute, private router: Router, private doctorFakeDataService: DoctorFakeDataService) {
    this.selectedDate = this.route.snapshot.paramMap.get('date');

    this.availabilitySlots = this.doctorFakeDataService.getAvailabilitySlots();
  }
}
