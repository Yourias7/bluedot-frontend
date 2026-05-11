import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorResultPage } from './doctor-result-page';

describe('DoctorResultPage', () => {
  let component: DoctorResultPage;
  let fixture: ComponentFixture<DoctorResultPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorResultPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorResultPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
