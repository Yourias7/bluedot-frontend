import { Component } from '@angular/core';
import { Logo } from '../common/logo/logo';
import { Router, RouterLink } from "@angular/router";
import { DoctorSearchService } from '../../../../shared/services/doctor-search-service';
import { Specialty } from '../../../../shared/domain/specialty';

export interface CityCoordinates {
  name: string;
  lat: number;
  lng: number;
}

export const cities: CityCoordinates[] = [
  {
    name: "Athens",
    lat: 37.9838,
    lng: 23.7275
  },
  {
    name: "Thessaloniki",
    lat: 40.6401,
    lng: 22.9444
  },
  {
    name: "Patras",
    lat: 38.2466,
    lng: 21.7346
  },
  {
    name: "Drama",
    lat: 41.1490,
    lng: 24.1473
  },
  {
    name: "Syros",
    lat: 37.4447,
    lng: 24.9425
  }
];

@Component({
  selector: 'app-footer',
  imports: [Logo, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

  constructor(private searchService: DoctorSearchService, private router: Router) {}


  searchDoctorsBySpecialty(spec: string) {
    this.searchService.getSpecialties().subscribe((specs) => {
      const match = specs.find(s => s.name === spec);
      this.router.navigate(['/search-results'], {
        queryParams: match
          ? { specialtyId: match.id, specialtyName: match.name }
          : { specialtyName: spec }
      });
    });
  }

  searchCityDoctors(city: string) {
    const cityCoords = cities.find(c => c.name === city);
    if (!cityCoords) return;
    this.router.navigate(['/search-results'], {
      queryParams: { lat: cityCoords.lat, lon: cityCoords.lng, locationName: cityCoords.name }
    });
  }
}
