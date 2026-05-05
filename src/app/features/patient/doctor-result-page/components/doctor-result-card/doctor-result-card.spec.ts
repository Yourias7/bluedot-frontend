import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorResultCard } from './doctor-result-card';

describe('DoctorResultCard', () => {
  let component: DoctorResultCard;
  let fixture: ComponentFixture<DoctorResultCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorResultCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorResultCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
