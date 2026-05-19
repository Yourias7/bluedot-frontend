import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  @Input() doctorId: number | null = null;
  @Input() initialDate: string | null = null;
  @Input() initialSlotId: number | null = null;

  @Output() slotSelected = new EventEmitter<AvailabilitySlot>();
  @Output() selectionChanged = new EventEmitter<PatientSlotSelection>();

  availabilitySlots: AvailabilitySlot[] = [];

  selectedDate = this.formatDate(new Date());
  selectedDateObject: Date = this.todayAtMidnight();

  minSelectableDate: Date = this.todayAtMidnight();

  selectedSlot: AvailabilitySlot | null = null;

  isLoadingSlots = true;
  loadError: string | null = null;

  private initialized = false;

  constructor(
    private doctorService: DoctorService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initialized = true;
    this.applyInitialSelection();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.initialized) {
      return;
    }

    if (changes['initialDate'] || changes['initialSlotId'] || changes['doctorId']) {
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: this.selectedDate },
      queryParamsHandling: 'merge'
    });

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
  }

  private loadSlotsForSelectedDate() {
    if (this.doctorId === null || this.doctorId === undefined) {
      console.warn('[DoctorAvailabilityPatientSide] Skipping slot load: doctorId is not set.');
      queueMicrotask(() => {
        this.availabilitySlots = [];
        this.isLoadingSlots = false;
        this.cdr.markForCheck();
      });
      return;
    }

    const doctorId = this.doctorId;
    const dateForRequest = this.selectedDate;

    console.debug(
      `[DoctorAvailabilityPatientSide] Fetching slots for doctorId=${doctorId}, date=${dateForRequest}`
    );

    queueMicrotask(() => {
      this.isLoadingSlots = true;
      this.loadError = null;
      this.cdr.markForCheck();

      this.doctorService
        .loadAvailableSlotsForDoctor(doctorId, dateForRequest)
        .subscribe({
          next: (slots) => {
            if (this.selectedDate !== dateForRequest) {
              return;
            }

            console.debug(
              `[DoctorAvailabilityPatientSide] Received ${slots.length} free slot(s) for ${dateForRequest}`,
              slots
            );
            this.availabilitySlots = this.filterOutPastSlots(slots);
            this.isLoadingSlots = false;
            this.applyInitialSlotMatch();
            this.cdr.markForCheck();
          },
          error: (error) => {
            if (this.selectedDate !== dateForRequest) {
              return;
            }

            console.error('[DoctorAvailabilityPatientSide] Failed to load doctor availability slots:', error);
            this.availabilitySlots = [];
            this.isLoadingSlots = false;
            this.loadError = 'Αποτυχία φόρτωσης διαθεσιμοτήτων.';
            this.cdr.markForCheck();
          }
        });
    });
  }

  private filterOutPastSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
    const today = this.formatDate(new Date());

    if (this.selectedDate !== today) {
      return slots;
    }

    const nowMinutes = this.minutesSinceMidnight(new Date());

    return slots.filter(slot => this.parseTimeToMinutes(slot.startTime) > nowMinutes);
  }

  private todayAtMidnight(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private minutesSinceMidnight(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  private parseTimeToMinutes(time: string): number {
    if (!time || !time.includes(':')) {
      return 0;
    }

    const parts = time.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return 0;
    }

    return hours * 60 + minutes;
  }

  private applyInitialSlotMatch() {
    if (this.initialSlotId === null) {
      return;
    }

    const matchingSlot = this.availabilitySlots.find(slot => slot.id === this.initialSlotId);

    if (matchingSlot !== undefined) {
      this.selectedSlot = matchingSlot;

      this.selectionChanged.emit({
        date: this.selectedDate,
        slot: matchingSlot
      });
    }
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
