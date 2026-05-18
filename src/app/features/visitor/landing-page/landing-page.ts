import { Component } from '@angular/core';
import { HomeHeroSection } from "./components/home-hero-section/home-hero-section";
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { NominatimService, LocationSuggestion } from '../../../shared/services/nominatim.service';


@Component({
  selector: 'app-landing-page',
  imports: [HomeHeroSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {

  items: Specialty[] = [];

  locationSuggestions: LocationSuggestion[] = [];


  constructor(private searchService:DoctorSearchService, private nominatimService: NominatimService){

  }

   ngOnInit() {
    this.searchService.getSpecialties().subscribe((data) => {
      console.log(data)
      this.items=data;
    })
  }

  onSearchLocation(query: string) {
    // Call your custom Nominatim service method
    this.nominatimService.searchAddress(query).subscribe((results: LocationSuggestion[]) => {
       this.locationSuggestions = results;
    });
  }
}
