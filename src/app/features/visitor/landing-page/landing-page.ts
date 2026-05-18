import { Component } from '@angular/core';
import { HomeHeroSection } from "./components/home-hero-section/home-hero-section";
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { NominatimService, LocationSuggestion } from '../../../shared/services/nominatim.service';
import { Route, Router } from '@angular/router';

const radiusKm = 3.5;

@Component({
  selector: 'app-landing-page',
  imports: [HomeHeroSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  items: Specialty[] = [];

  locationSuggestions: LocationSuggestion[] = [];
  selectedSpecialty?: Specialty;
  selectedLocationSuggestion?: LocationSuggestion;

  specialtyQuery = '';
  locationQuery = '';

  constructor(private searchService: DoctorSearchService, private nominatimService: NominatimService, private router: Router) {

  }

  ngOnInit() {
    this.searchService.getSpecialties().subscribe((data) => {
      console.log(data)
      this.items = data;
    })
  }

  onSpecialtyInput(query: string) {
    this.specialtyQuery = query;
    const match = this.items.find(item => item.name?.toLowerCase() === query.toLowerCase());
    this.selectedSpecialty = match;
  }

  onLocationTextChange(query: string) {
    this.locationQuery = query;
  }

  onSearchLocation(query: string) {
    this.locationQuery = query;
    this.nominatimService.searchAddress(query).subscribe((results: LocationSuggestion[]) => {
      this.locationSuggestions = results;
    });
  }

  search() {
    if (!this.selectedSpecialty && this.specialtyQuery) {
      this.selectedSpecialty = this.items.find(item => item.name?.toLowerCase() === this.specialtyQuery.toLowerCase());
    }

    if (!this.selectedLocationSuggestion && this.locationQuery) {
      this.selectedLocationSuggestion = this.locationSuggestions.find(item => item.displayName?.toLowerCase() === this.locationQuery.toLowerCase());
    }

  
    this.searchService.searchDoctors(this.selectedSpecialty?.id,
      this.selectedLocationSuggestion?.lat,
      this.selectedLocationSuggestion?.lon,
      radiusKm).subscribe((response) => {
          this.router.navigate(['/search-results', response]);
      });
  }
}
