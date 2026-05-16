import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorBasicInfo } from './doctor-basic-info';

describe('DoctorBasicInfo', () => {
  let component: DoctorBasicInfo;
  let fixture: ComponentFixture<DoctorBasicInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorBasicInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorBasicInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
