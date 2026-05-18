import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Specialty } from '../../../../../shared/domain/specialty';


@Component({
  selector: 'app-home-hero-section',
  imports: [IconFieldModule, InputIconModule, InputTextModule, FloatLabel],
  templateUrl: './home-hero-section.html',
  styleUrl: './home-hero-section.scss',
})
export class HomeHeroSection {
  @Input() specialties: Specialty[] = [];

  @Input() locations: any[] = [];

  @Output() locationSearch = new EventEmitter<string>();

  onLocationInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query.length > 2) {
      this.locationSearch.emit(query);
    }
  }
}