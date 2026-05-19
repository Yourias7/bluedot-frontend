import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Doctor } from '../../../shared/domain/doctor';
import { Specialty } from '../../../shared/domain/specialty';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { NominatimService, LocationSuggestion } from '../../../shared/services/nominatim.service';
import { DoctorResultCard } from './components/doctor-result-card/doctor-result-card';

export type DoctorSortBy = 'reviews' | 'name';

@Component({
  selector: 'app-doctor-result-page',
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    PaginatorModule,
    AutoCompleteModule,
    DoctorResultCard,
  ],
  templateUrl: './doctor-result-page.html',
  styleUrl: './doctor-result-page.scss',
})
export class DoctorResultPage implements OnInit, OnDestroy {

  private static readonly DEFAULT_RADIUS_KM = 10;
  private queryParamsSubscription?: Subscription;

  doctors: Doctor[] = [];
  first = 0;
  rows = 5;

  doctorLoadError: string | null = null;

  sortBy: DoctorSortBy = 'reviews';

  specialties: Specialty[] = [];
  filteredSpecialties: Specialty[] = [];
  selectedSpecialty: Specialty | string | null = null;

  locationSuggestions: LocationSuggestion[] = [];
  selectedLocation: LocationSuggestion | string | null = null;

  constructor(
    private searchService: DoctorSearchService,
    private nominatimService: NominatimService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSpecialties();

    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.applyQueryParams(params);
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  private applyQueryParams(params: Params): void {
    const specialtyId = params['specialtyId'] ? +params['specialtyId'] : null;
    const specialtyName: string = params['specialtyName'] ?? '';
    const lat = params['lat'] ? +params['lat'] : null;
    const lon = params['lon'] ? +params['lon'] : null;
    const locationName: string = params['locationName'] ?? '';

    this.selectedSpecialty = null;
    this.selectedLocation = null;

    if (specialtyId && specialtyName) {
      this.selectedSpecialty = { id: specialtyId, name: specialtyName };
    } else if (specialtyName) {
      this.selectedSpecialty = specialtyName;
    }

    if (lat != null && lon != null && locationName) {
      this.selectedLocation = { lat, lon, displayName: locationName };
    } else if (locationName) {
      this.selectedLocation = locationName;
    }

    this.loadDoctors(specialtyId, lat, lon);
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

  filterLocations(event: { originalEvent: Event; query: string }) {
    const query = event.query?.trim() ?? '';

    if (query.length < 3) {
      this.locationSuggestions = [];
      this.cdr.detectChanges();
      return;
    }

    this.nominatimService.searchAddress(query).subscribe({
      next: results => {
        this.locationSuggestions = results ?? [];
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load location suggestions:', error);
        this.locationSuggestions = [];
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters() {
    const resolvedLocation = this.resolveSelectedLocation();
    const specialtyId = this.resolveSelectedSpecialtyId();
    const lat = resolvedLocation?.lat ?? null;
    const lng = resolvedLocation?.lon ?? null;
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

  private resolveSelectedLocation(): LocationSuggestion | null {
    const value = this.selectedLocation;

    if (value && typeof value === 'object') {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const needle = value.trim().toLowerCase();
      return (
        this.locationSuggestions.find(
          suggestion => suggestion.displayName.toLowerCase() === needle
        ) ?? null
      );
    }

    return null;
  }
}
