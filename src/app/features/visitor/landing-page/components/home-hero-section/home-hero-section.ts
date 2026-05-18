import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Specialty } from '../../../../../shared/domain/specialty';
import { DoctorSearchService } from '../../../../../shared/services/doctor-search-service';


@Component({
  selector: 'app-home-hero-section',
  imports: [IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './home-hero-section.html',
  styleUrl: './home-hero-section.scss',
})
export class HomeHeroSection {
  @Input() specialties: Specialty[] = [];

  @Input() locations: any[] = [];

  @Input() specialtyQuery = '';
  @Input() locationQuery = '';

  @Output() specialtyQueryChange = new EventEmitter<string>();
  @Output() locationQueryChange = new EventEmitter<string>();
  @Output() locationSearch = new EventEmitter<string>();
  @Output() searchClicked = new EventEmitter<void>();

  constructor(private doctorSearchService:DoctorSearchService){

  }

  onSpecialtyInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.specialtyQueryChange.emit(query);
  }

  onLocationInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.locationQueryChange.emit(query);
    if (query.length > 2) {
      this.locationSearch.emit(query);
    }
  }

}
