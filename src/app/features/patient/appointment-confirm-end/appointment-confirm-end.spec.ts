import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentConfirmEnd } from './appointment-confirm-end';

describe('AppointmentConfirmEnd', () => {
  let component: AppointmentConfirmEnd;
  let fixture: ComponentFixture<AppointmentConfirmEnd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentConfirmEnd],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentConfirmEnd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
