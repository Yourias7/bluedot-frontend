import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

import { DoctorService } from '../../../shared/services/doctor-service';
import { AvailabilitySlot } from '../../../shared/domain/availability-slot';

export type PatientSlotSelection = {
  date: string;
  slot: AvailabilitySlot;
};

@Component({
  selector: 'app-doctor-availability-patient-side',
  imports: [FormsModule, DatePickerModule],
  templateUrl: './doctor-availability-patient-side.html',
  styleUrl: './doctor-availability-patient-side.scss',
})
export class DoctorAvailabilityPatientSide implements OnInit, OnChanges {
  @Input() initialDate: string | null = null;
  @Input() initialSlotId: number | null = null;

  @Output() slotSelected = new EventEmitter<AvailabilitySlot>();
  @Output() selectionChanged = new EventEmitter<PatientSlotSelection>();

  availabilitySlots: AvailabilitySlot[] = [];

  selectedDate = this.formatDate(new Date());
  selectedDateObject: Date = new Date();

  selectedSlot: AvailabilitySlot | null = null;

  constructor(private doctorService: DoctorService) {}

  ngOnInit() {
    this.applyInitialSelection();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialDate'] || changes['initialSlotId']) {
      this.applyInitialSelection();
    }
  }

  onDateChanged(date: Date | null) {
    if (date === null) {
      return;
    }

    this.selectedDateObject = date;
    this.selectedDate = this.formatDate(date);
    this.selectedSlot = null;

    this.loadSlotsForSelectedDate();
  }

  pickSlot(slot: AvailabilitySlot) {
    if (slot.status !== 'free') {
      return;
    }

    this.selectedSlot = slot;
    this.slotSelected.emit(slot);

    this.selectionChanged.emit({
      date: this.selectedDate,
      slot: slot
    });
  }

  private applyInitialSelection() {
    if (this.initialDate !== null) {
      this.selectedDate = this.initialDate;
      this.selectedDateObject = this.parseDate(this.initialDate);
    }

    this.loadSlotsForSelectedDate();

    if (this.initialSlotId !== null) {
      const matchingSlot = this.availabilitySlots.find(slot => slot.id === this.initialSlotId);

      if (matchingSlot !== undefined) {
        this.selectedSlot = matchingSlot;

        this.selectionChanged.emit({
          date: this.selectedDate,
          slot: matchingSlot
        });
      }
    }
  }

  private loadSlotsForSelectedDate() {
    this.availabilitySlots = this.doctorService.getTransferSlotsByDate(this.selectedDate);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const format = (num: number) => num.toString().padStart(2, '0');

    return `${year}-${format(month)}-${format(day)}`;
  }

  private parseDate(dateText: string): Date {
    const parts = dateText.split('-');

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    return new Date(year, month, day);
  }
}