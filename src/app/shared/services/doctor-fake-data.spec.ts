import { TestBed } from '@angular/core/testing';

import { DoctorFakeData } from './doctor-fake-data';

describe('DoctorFakeData', () => {
  let service: DoctorFakeData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoctorFakeData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
