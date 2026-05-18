import { Component } from '@angular/core';
import { HomeHeroSection } from "./components/home-hero-section/home-hero-section";
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { NominatimService, LocationSuggestion } from '../../../shared/services/nominatim.service';
import { Route, Router } from '@angular/router';


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

    this.router.navigate(['/search-results'], {
      queryParams: {
        specialtyId: this.selectedSpecialty?.id,
        lat: this.selectedLocationSuggestion?.lat,
        lng: this.selectedLocationSuggestion?.lon,
        radiusKm: 10
      }
    });
  }
}
