import { Component, OnDestroy, OnInit } from '@angular/core';
import { Logo } from '../common/logo/logo';
import { Router, RouterLink } from "@angular/router";
import { DoctorSearchService } from '../../../../shared/services/doctor-search-service';
import { Specialty } from '../../../../shared/domain/specialty';
import { AuthenticationServices } from '../../../../shared/services/authentication-services';
import { UserRole } from '../../../../shared/domain/user-role';
import { Subscription } from 'rxjs';

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
export class Footer implements OnInit, OnDestroy {

  specialty?: Specialty;
  currentUserRole?: UserRole;
  private authSubscription: Subscription = new Subscription();

  constructor(private searchService: DoctorSearchService, private router: Router, private authSevices:AuthenticationServices) {

  }

  ngOnInit(): void {
      this.authSubscription.add(
      this.authSevices.currentUserRole$.subscribe(role => {
        this.currentUserRole = role;
      })
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  isDoctor():boolean{
    return this.currentUserRole=='doctor';
  }

  searchDoctorsBySpecialty(spec: string) {
    this.searchService.getSpecialties().subscribe((specs) => {
      this.specialty = specs.find((val) => {val.name.includes(spec);});
      this.searchService.searchDoctors(this.specialty?.id).subscribe((response) => {
          console.log(response);
          this.router.navigate(['/search-results']);
        });
    });


  }

  searchCityDoctors(city: string) {
    let cityCoords = cities.find((_city) => _city.name == city);
    this.searchService.searchDoctors(undefined).subscribe((response) => {
        console.log(response);
        this.router.navigate(['/search-results']);
      });
  }
}
