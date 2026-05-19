import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppointmentConfirmEnd } from './appointment-confirm-end';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { UserRole } from '../../../shared/domain/user';

describe('AppointmentConfirmEnd', () => {
  let component: AppointmentConfirmEnd;
  let fixture: ComponentFixture<AppointmentConfirmEnd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentConfirmEnd],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { doctorId: '1' }
            }
          }
        },
        {
          provide: DoctorSearchService,
          useValue: {
            loadDoctorById: () => of({
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              bio: 'Bio',
              clinicAddress: 'Address',
              phoneNumber: '555-1234',
              yearsOfExperience: 10,
              password: '',
              role: UserRole.Doctor,
              specialties: [],
              averageRating: 4.5,
              reviewCount: 12
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentConfirmEnd);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
