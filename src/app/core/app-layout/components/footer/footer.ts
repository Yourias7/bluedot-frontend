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
    name: "Αθήνα",
    lat: 37.9838,
    lng: 23.7275
  },
  {
    name: "Θεσσαλονίκη",
    lat: 40.6401,
    lng: 22.9444
  },
  {
    name: "Πάτρα",
    lat: 38.2466,
    lng: 21.7346
  },
  {
    name: "Δράμα",
    lat: 41.1490,
    lng: 24.1473
  },
  {
    name: "Σύρος",
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
      const match = specs.find(s => s.name === spec);
      const queryParams = match
        ? { specialtyId: match.id, specialtyName: match.name }
        : { specialtyName: spec };
      this.navigateToSearchResults(queryParams);
    });
  }

  searchCityDoctors(city: string) {
    const cityCoords = cities.find(c => c.name === city);
    if (!cityCoords) return;
    this.navigateToSearchResults({
      lat: cityCoords.lat,
      lon: cityCoords.lng,
      locationName: cityCoords.name
    });
  }

  private navigateToSearchResults(queryParams: Record<string, string | number | undefined>): void {
    void this.router.navigate(['/search-results'], { queryParams }).then(success => {
      if (!success) {
        void this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          void this.router.navigate(['/search-results'], { queryParams });
        });
      }
    });
  }
}
