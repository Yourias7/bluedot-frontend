import { Component } from '@angular/core';
import { HomeHeroSection } from "./components/home-hero-section/home-hero-section";
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';

@Component({
  selector: 'app-landing-page',
  imports: [HomeHeroSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {

  items: Specialty[] = [];
  constructor(private searchService:DoctorSearchService){

  }

   ngOnInit() {
    this.searchService.getSpecialties().subscribe((data) => {
      console.log(data)
      this.items=data;
    })
  }
}
