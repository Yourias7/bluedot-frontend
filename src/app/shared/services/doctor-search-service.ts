import { Injectable } from '@angular/core';
import { Doctor } from '../domain/doctor';
import { UserRole } from '../domain/user';
import { Specialty } from '../domain/specialty';

@Injectable({
  providedIn: 'root',
})
export class DoctorSearchService {

  private specialties:Specialty[]=[
    {
      id: 0,
      name: "Cardiologist"
    },
    {
      id: 1,
      name: "Psychiatrist"
    }
  ]

  private doctors: Doctor[] = [
    {
      id: 0,
      firstName: 'John',
      lastName: 'Doe',
      email: '',
      bio: 'Experienced cardiologist with over 15 years of practice.',
      clinicAddress: '123 Heart St, Cardio City',
      phoneNumber: '555-1234',
      yearsOfExperience: 15,
      password: '',
      role: UserRole.Doctor,
      specialty: this.specialties[0]
    },
    {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: '',
      bio: 'Experienced psychiatrist with over 5 years of practice.',
      clinicAddress: '40 Burke & Hearr St, London',
      phoneNumber: '555-1000',
      yearsOfExperience: 5,
      password: '',
      role: UserRole.Doctor,
       specialty: this.specialties[1]
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Doe',
      email: '',
      bio: 'Experienced psychiatrist with over 5 years of practice.',
      clinicAddress: '40 Burke & Hearr St, London',
      phoneNumber: '555-1000',
      yearsOfExperience: 5,
      password: '',
      role: UserRole.Doctor,
       specialty: this.specialties[1]
    },
    {
      id: 3,
      firstName: 'Jane',
      lastName: 'Doe',
      email: '',
      bio: 'Experienced psychiatrist with over 5 years of practice.',
      clinicAddress: '40 Burke & Hearr St, London',
      phoneNumber: '555-1000',
      yearsOfExperience: 5,
      password: '',
      role: UserRole.Doctor,
       specialty: this.specialties[1]
    },
    {
      id: 4,
      firstName: 'Jane',
      lastName: 'Doe',
      email: '',
      bio: 'Experienced psychiatrist with over 5 years of practice.',
      clinicAddress: '40 Burke & Hearr St, London',
      phoneNumber: '555-1000',
      yearsOfExperience: 5,
      password: '',
      role: UserRole.Doctor,
       specialty: this.specialties[1]
    },
    {
      id: 5,
      firstName: 'Jane',
      lastName: 'Doe',
      email: '',
      bio: 'Experienced psychiatrist with over 5 years of practice.',
      clinicAddress: '40 Burke & Hearr St, London',
      phoneNumber: '555-1000',
      yearsOfExperience: 5,
      password: '',
      role: UserRole.Doctor,
       specialty: this.specialties[1]
    },
  ]

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  getDoctorById(id: number): Doctor | undefined {
    return this.doctors.find(doctor => doctor.id === id);
  }

  getSpecialties(): Specialty[] {
    return this.specialties;
  }
}