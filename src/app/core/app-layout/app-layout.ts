import { Component } from '@angular/core';
import { Header } from '../components/header/header';
import { Footer } from '../components/footer/footer';
import { HomeHeroSection } from '../../features/home-hero-section/home-hero-section';


@Component({
  selector: 'app-layout',
  imports: [Header, Footer, HomeHeroSection],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {}
