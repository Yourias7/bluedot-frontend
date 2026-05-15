import { Component } from '@angular/core';
import { HomeHeroSection } from "./components/home-hero-section/home-hero-section";

@Component({
  selector: 'app-landing-page',
  imports: [HomeHeroSection],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {}
