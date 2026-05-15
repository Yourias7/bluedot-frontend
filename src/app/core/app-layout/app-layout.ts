import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { HomeHeroSection } from '../../features/visitor/landing-page/components/home-hero-section/home-hero-section';
import { LandingPage } from "../../features/visitor/landing-page/landing-page";
import { RouterOutlet } from "@angular/router";


@Component({
  selector: 'app-layout',
  imports: [Header, Footer, HomeHeroSection, LandingPage, RouterOutlet],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {}
