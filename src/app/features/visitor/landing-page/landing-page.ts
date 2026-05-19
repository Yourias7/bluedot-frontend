import { Component } from '@angular/core';
import { HomeHeroSection } from "./components/home-hero-section/home-hero-section";
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { LocationSuggestion } from '../../../shared/services/nominatim.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [HomeHeroSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  items: Specialty[] = [];

  selectedSpecialty: Specialty | string | null = null;
  selectedLocation: LocationSuggestion | string | null = null;

  constructor(private searchService: DoctorSearchService, private router: Router) {

  }

  ngOnInit() {
    this.searchService.getSpecialties().subscribe((data) => {
      console.log(data)
      this.items = data;
    })
  }

  onSpecialtyChange(value: Specialty | string | null) {
    this.selectedSpecialty = value;

    if (value && typeof value === 'object') {
      return;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const needle = value.trim().toLowerCase();
      this.selectedSpecialty =
        this.items.find(item => item.name?.toLowerCase() === needle) ?? value;
    }
  }

  onLocationChange(value: LocationSuggestion | string | null) {
    this.selectedLocation = value;
  }

  search() {
    const resolvedSpecialty = this.resolveSelectedSpecialty();
    const resolvedLocation = this.resolveSelectedLocation();

    const queryParams: Record<string, string | number> = {};

    if (resolvedSpecialty) {
      queryParams['specialtyId'] = resolvedSpecialty.id;
      queryParams['specialtyName'] = resolvedSpecialty.name;
    }

    if (resolvedLocation) {
      queryParams['lat'] = resolvedLocation.lat;
      queryParams['lon'] = resolvedLocation.lon;
      queryParams['locationName'] = resolvedLocation.displayName;
    }

    this.router.navigate(['/search-results'], { queryParams });
  }

  private resolveSelectedSpecialty(): Specialty | null {
    const value = this.selectedSpecialty;

    if (value && typeof value === 'object') {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const needle = value.trim().toLowerCase();
      return (
        this.items.find(item => item.name?.toLowerCase() === needle) ?? null
      );
    }

    return null;
  }

  private resolveSelectedLocation(): LocationSuggestion | null {
    const value = this.selectedLocation;

    if (value && typeof value === 'object') {
      return value;
    }

    return null;
  }
}
