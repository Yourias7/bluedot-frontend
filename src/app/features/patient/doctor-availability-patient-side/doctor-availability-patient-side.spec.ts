import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAvailabilityPatientSide } from './doctor-availability-patient-side';

describe('DoctorAvailabilityPatientSide', () => {
  let component: DoctorAvailabilityPatientSide;
  let fixture: ComponentFixture<DoctorAvailabilityPatientSide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAvailabilityPatientSide],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorAvailabilityPatientSide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
