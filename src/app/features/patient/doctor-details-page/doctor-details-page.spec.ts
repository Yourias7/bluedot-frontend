import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDetailsPage } from './doctor-details-page';

describe('DoctorDetailsPage', () => {
  let component: DoctorDetailsPage;
  let fixture: ComponentFixture<DoctorDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
