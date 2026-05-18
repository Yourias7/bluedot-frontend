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

  specialty?: Specialty;

  constructor(private searchService: DoctorSearchService, private router: Router) {

  }

  searchDoctorsBySpecialty(spec: string) {
    this.searchService.getSpecialties().subscribe((specs) => {
      this.specialty = specs.find((val) => {val.name == spec;});
      this.searchService.searchDoctors(this.specialty?.id,
        undefined,
        undefined,
        10).subscribe((response) => {
          this.router.navigate(['/search-results', response]);
        });
    });


  }

  searchCityDoctors(city: string) {
    let cityCoords = cities.find((_city) => _city.name == city);
    this.searchService.searchDoctors(undefined,
      cityCoords?.lat,
      cityCoords?.lng,
      10).subscribe((response) => {
        this.router.navigate(['/search-results', response]);
      });
  }
}
