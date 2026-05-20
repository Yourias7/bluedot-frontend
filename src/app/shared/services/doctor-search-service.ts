// Service for searching doctors by specialty and location, and loading individual doctor details
import { Injectable } from '@angular/core';
import { Doctor } from '../domain/doctor';
import { UserRole } from '../domain/user';
import { Specialty } from '../domain/specialty';
import { Review } from '../domain/review';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable, map } from 'rxjs';

type PagedResultDto<T> = {
  totalCount: number;
  page: number;
  pageSize: number;
  items: T[];
};

// Both PascalCase and camelCase variants are declared because the backend
// returns inconsistent casing across different endpoints
type DoctorSearchResultDto = {
  Id?: number;         id?: number;
  FirstName?: string;  firstName?: string;
  LastName?: string;   lastName?: string;
  ClinicAddress?: string; clinicAddress?: string;
  Bio?: string;        bio?: string;
  Latitude?: number;   latitude?: number;
  Longitude?: number;  longitude?: number;
  DistanceKm?: number; distanceKm?: number;
  AverageRating?: number; averageRating?: number;
  ReviewCount?: number;   reviewCount?: number;
  Specialties?: string[]; specialties?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DoctorSearchService {

  private baseUrl = environment.apiUrl;
  constructor(private httpClient: HttpClient) {

  }

  // TODO: remove — placeholder specialties used before the /specialty endpoint was wired up
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

  // TODO: remove — stub data used before the /doctors endpoint was wired up
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

  loadDoctorById(id: number): Observable<Doctor> {
    return this.httpClient.get<Doctor>(`${this.baseUrl}/doctors/${id}`).pipe(
      map(doctor => ({
        ...doctor,
        specialties: this.normalizeSpecialties(doctor)
      }))
    );
  }

  private normalizeSpecialties(doctor: Doctor & { Specialties?: unknown[] }): Specialty[] {
    const list = doctor.specialties ?? doctor.Specialties;

    if (!Array.isArray(list)) {
      return [];
    }

    return list
      .map((item, index) => {
        if (typeof item === 'string') {
          return { id: index, name: item };
        }

        const specialty = item as Specialty & { Name?: string; Id?: number };

        return {
          id: specialty.id ?? specialty.Id ?? index,
          name: specialty.name ?? specialty.Name ?? ''
        };
      })
      .filter(specialty => specialty.name.length > 0);
  }

  loadReviewsByDoctorId(id: number): Observable<Review[]> {
    // backend may return a plain array or a paged wrapper — handle both
    return this.httpClient
      .get<Review[] | { items: Review[] }>(`${this.baseUrl}/doctors/${id}/reviews`)
      .pipe(
        map(response => Array.isArray(response) ? response : response.items ?? [])
      );
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
    specialtyId?: number | null,
    lat?: number | null,
    lng?: number | null,
    radiusKm: number = 3.5, // default search radius in kilometres
    page: number = 1,
    pageSize: number = 6
  ): Observable<Doctor[]> {
    let params = new HttpParams();

    if (specialtyId !== undefined && specialtyId !== null) {
      params = params.set('specialtyId', String(specialtyId));
    }

      if (lat !== undefined && lat !== null) {
      params = params.set('lat', String(lat));
    }

    if (lng !== undefined && lng !== null) {
      params = params.set('lng', String(lng));
    }

    if (radiusKm !== undefined && radiusKm !== null) {
      params = params.set('radiusKm', String(radiusKm));
    }

    params = params.set('page', String(page)).set('pageSize', String(pageSize));

    return this.httpClient
      .get<PagedResultDto<DoctorSearchResultDto> | DoctorSearchResultDto[]>(`${this.baseUrl}/doctors`, { params })
      .pipe(
        map(response => Array.isArray(response) ? response : response.items ?? []),
        map(dtos => dtos.map(dto => this.mapSearchResultToDoctor(dto)))
      );
  }

  private mapSearchResultToDoctor(dto: DoctorSearchResultDto): Doctor {
    const rawSpecialties = dto.Specialties ?? dto.specialties ?? [];
    const specialties = rawSpecialties.map((name, index) => ({ id: index, name }));
    return {
      id: dto.Id ?? dto.id ?? 0,
      firstName: dto.FirstName ?? dto.firstName ?? '',
      lastName: dto.LastName ?? dto.lastName ?? '',
      email: '',
      password: '',
      role: UserRole.Doctor,
      bio: dto.Bio ?? dto.bio ?? '',
      clinicAddress: dto.ClinicAddress ?? dto.clinicAddress ?? '',
      phoneNumber: '',
      yearsOfExperience: 0,
      latitude: dto.Latitude ?? dto.latitude,
      longitude: dto.Longitude ?? dto.longitude,
      specialty: specialties[0],
      specialties,
      averageRating: dto.AverageRating ?? dto.averageRating,
      reviewCount: dto.ReviewCount ?? dto.reviewCount,
    };
  }
}
