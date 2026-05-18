import { Injectable } from '@angular/core';
import { Doctor } from '../domain/doctor';
import { UserRole } from '../domain/user';
import { Specialty } from '../domain/specialty';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

type DoctorSearchResultDto =
  {
    Id: number;
    FirstName: string;
    LastName: string;
    ClinicAddress: string;
    Bio: string;
    Latitude: number;
    Longitude: number
    DistanceKm: number;
    AverageRating: number;
    ReviewCount: number;
    Specialties: string[];
  }

@Injectable({
  providedIn: 'root',
})
export class DoctorSearchService {

  private baseUrl = environment.apiUrl;
  constructor(private httpClient: HttpClient) {

  }

  private specialties: Specialty[] = [
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

  //TODO: Test meee
  getSpecialties(): Observable<Specialty[]> {
    //return this.specialties;
    return this.httpClient.get<Specialty[]>(`${this.baseUrl}/specialty`);
  }

  getDoctor():Observable<DoctorSearchResultDto[]>{
    return this.httpClient.get<DoctorSearchResultDto[]>(`${this.baseUrl}/doctor`);
  }

  searchDoctors(
    specialtyId?: number,
    lat?: number,
    lng?: number,
    radiusKm?: number
  ): Observable<any> {

    let params = new HttpParams();

    if (specialtyId !== undefined) {
      params = params.set('specialtyId', specialtyId);
    }

    if (lat !== undefined) {
      params = params.set('lat', lat);
    }

    if (lng !== undefined) {
      params = params.set('lng', lng);
    }

    if (radiusKm !== undefined) {
      params = params.set('radiusKm', radiusKm);
    }

    return this.httpClient.get(`${this.baseUrl}/doctors`, { params });
  }

}