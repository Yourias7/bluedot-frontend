import { Component } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';


@Component({
  selector: 'app-home-hero-section',
  imports: [IconFieldModule, InputIconModule, InputTextModule, FloatLabel],
  templateUrl: './home-hero-section.html',
  styleUrl: './home-hero-section.scss',
})
export class HomeHeroSection {}
