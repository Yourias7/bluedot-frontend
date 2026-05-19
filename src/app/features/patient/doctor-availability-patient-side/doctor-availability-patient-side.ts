import { Component, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../shared/services/doctor-service';
import { AvailabilitySlot } from '../../../shared/domain/availability-slot';


@Component({
  selector: 'app-doctor-availability-patient-side',
  imports: [],
  templateUrl: './doctor-availability-patient-side.html',
  styleUrl: './doctor-availability-patient-side.scss',
})
export class DoctorAvailabilityPatientSide {
  @Output() slotSelected = new EventEmitter<AvailabilitySlot>();

  availabilitySlots: AvailabilitySlot[] = [];
  selectedDate: string | null = null;
  selectedSlot: AvailabilitySlot | null = null;
  showSlotMenu = false;
  menuX = 0;
  menuY = 0;

  constructor(private route: ActivatedRoute, private router: Router, private doctorService: DoctorService) {
    this.selectedDate = this.route.snapshot.paramMap.get('date');
    this.availabilitySlots = this.doctorService.getAvailabilitySlots();
  }

  pickSlot(slotId: number) {
    const slot = this.availabilitySlots.find(s => s.id === slotId);
    if (slot) {
      this.selectedSlot = slot;
      this.slotSelected.emit(slot);
    }
  }
}
