import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AppointmentConfirm } from './appointment-confirm';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { AppointmentService } from '../../../shared/services/appointment-service';
import { UserRole } from '../../../shared/domain/user';

describe('AppointmentConfirm', () => {
  let component: AppointmentConfirm;
  let fixture: ComponentFixture<AppointmentConfirm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentConfirm],
      providers: [
        provideRouter([]),
        {
          provide: AppointmentService,
          useValue: {
            requestAppointment: () => of({ message: 'Appointment requested.' })
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

    fixture = TestBed.createComponent(AppointmentConfirm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
