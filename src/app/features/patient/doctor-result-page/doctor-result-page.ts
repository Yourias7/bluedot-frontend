import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { Doctor } from '../../../shared/domain/doctor';
import { Specialty } from '../../../shared/domain/specialty';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { NominatimService, LocationSuggestion } from '../../../shared/services/nominatim.service';
import { DoctorResultCard } from './components/doctor-result-card/doctor-result-card';

export type DoctorSortBy = 'relevance' | 'reviews' | 'name';

@Component({
  selector: 'app-doctor-result-page',
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    PaginatorModule,
    AutoCompleteModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DoctorResultCard,
  ],
  templateUrl: './doctor-result-page.html',
  styleUrl: './doctor-result-page.scss',
})
export class DoctorResultPage implements OnInit {

  private static readonly DEFAULT_RADIUS_KM = 10;

  doctors: Doctor[] = [];
  first = 0;
  rows = 5;

  doctorLoadError: string | null = null;

  sortBy: DoctorSortBy = 'relevance';

  specialties: Specialty[] = [];
  filteredSpecialties: Specialty[] = [];
  selectedSpecialty: Specialty | string | null = null;

  locationSuggestions: LocationSuggestion[] = [];
  selectedLocationSuggestion: LocationSuggestion | null = null;
  locationQuery = '';

  constructor(
    private searchService: DoctorSearchService,
    private nominatimService: NominatimService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.loadSpecialties();
  }

  get pagedDoctors(): Doctor[] {
    return this.doctors.slice(this.first, this.first + this.rows);
  }

  onPage(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  onCardClicked(id?: number) {
    this.router.navigate(['/doctor-details', id]);
  }

  filterSpecialties(event: { originalEvent: Event; query: string }) {
    const query = event.query?.toLowerCase() ?? '';
    this.filteredSpecialties = this.specialties.filter(
      specialty => specialty.name.toLowerCase().includes(query)
    );
  }

  onLocationInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.locationQuery = query;

    const matchedSuggestion = this.locationSuggestions.find(
      suggestion => suggestion.displayName === query
    );

    if (matchedSuggestion) {
      this.selectedLocationSuggestion = matchedSuggestion;
      this.applyFilters();
      return;
    }

    this.selectedLocationSuggestion = null;

    if (query.length < 3) {
      this.locationSuggestions = [];
      this.cdr.detectChanges();
      return;
    }

    this.nominatimService.searchAddress(query).subscribe({
      next: (results) => {
        this.locationSuggestions = results ?? [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load location suggestions:', error);
        this.locationSuggestions = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    if (!this.selectedLocationSuggestion && this.locationQuery.trim().length > 0) {
      this.selectedLocationSuggestion = this.locationSuggestions.find(
        suggestion => suggestion.displayName.toLowerCase() === this.locationQuery.trim().toLowerCase()
      ) ?? null;
    }

    const specialtyId = this.resolveSelectedSpecialtyId();
    const lat = this.selectedLocationSuggestion?.lat ?? null;
    const lng = this.selectedLocationSuggestion?.lon ?? null;
    // const radiusKm = this.selectedLocationSuggestion ? DoctorResultPage.DEFAULT_RADIUS_KM : null;
    var radiusKm = 3.5;

    this.loadDoctors(specialtyId, lat, lng, radiusKm);
  }

  setSortBy(sortBy: DoctorSortBy) {
    if (this.sortBy === sortBy) {
      return;
    }
    this.sortBy = sortBy;
    this.doctors = this.sortDoctors(this.doctors);
    this.first = 0;
    this.cdr.detectChanges();
  }

  private sortDoctors(doctors: Doctor[]): Doctor[] {
    const sorted = [...doctors];

    switch (this.sortBy) {
      case 'reviews':
        return sorted.sort(
          (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)
        );
      case 'name':
        return sorted.sort((a, b) =>
          this.fullName(a).localeCompare(this.fullName(b), 'el')
        );
      case 'relevance':
      default:
        return sorted;
    }
  }

  private fullName(doctor: Doctor): string {
    return `${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`.trim();
  }

  private loadSpecialties() {
    this.searchService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties ?? [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load specialties:', error);
      }
    });
  }

  private loadDoctors(
    specialtyId?: number | null,
    lat?: number | null,
    lng?: number | null,
    radiusKm: number = 3.5
  ) {
    this.doctorLoadError = null;

    this.searchService.searchDoctors(specialtyId, lat, lng, radiusKm).subscribe({
      next: (doctors) => {
        this.doctors = this.sortDoctors(doctors ?? []);
        this.first = 0;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load doctors:', error);
        this.doctorLoadError = 'Αποτυχία φόρτωσης ιατρών.';
        this.doctors = [];
        this.cdr.detectChanges();
      }
    });
  }

  private resolveSelectedSpecialtyId(): number | null {
    const value = this.selectedSpecialty;

    if (value && typeof value === 'object') {
      return value.id ?? null;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const needle = value.trim().toLowerCase();
      const match = this.specialties.find(
        specialty => specialty.name.toLowerCase() === needle
      );
      return match?.id ?? null;
    }

    return null;
  }
}
