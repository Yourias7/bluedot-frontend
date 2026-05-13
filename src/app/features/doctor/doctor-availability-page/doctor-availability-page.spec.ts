import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAvailabilityPage } from './doctor-availability-page';

describe('DoctorAvailabilityPage', () => {
  let component: DoctorAvailabilityPage;
  let fixture: ComponentFixture<DoctorAvailabilityPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAvailabilityPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorAvailabilityPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
