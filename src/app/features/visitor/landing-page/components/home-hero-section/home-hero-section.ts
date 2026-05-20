import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Specialty } from '../../../../../shared/domain/specialty';
import {
  LocationSuggestion,
  NominatimService,
} from '../../../../../shared/services/nominatim.service';

@Component({
  selector: 'app-home-hero-section',
  imports: [FormsModule, AutoCompleteModule],
  templateUrl: './home-hero-section.html',
  styleUrl: './home-hero-section.scss',
})
// Hero section of the landing page: specialty autocomplete + Nominatim location search
export class HomeHeroSection {
  @Input() specialties: Specialty[] = [];
  @Input() selectedSpecialty: Specialty | string | null = null;
  @Input() selectedLocation: LocationSuggestion | string | null = null;

  filteredSpecialties: Specialty[] = []; // subset shown in the specialty autocomplete dropdown
  filteredLocations: LocationSuggestion[] = []; // results from Nominatim shown in the location dropdown

  @Output() selectedSpecialtyChange = new EventEmitter<Specialty | string | null>();
  @Output() selectedLocationChange = new EventEmitter<LocationSuggestion | string | null>();
  @Output() searchClicked = new EventEmitter<void>();

  constructor(private nominatimService: NominatimService) {}

  onSpecialtyChange(value: Specialty | string | null) {
    this.selectedSpecialtyChange.emit(value);
  }

  onLocationChange(value: LocationSuggestion | string | null) {
    this.selectedLocationChange.emit(value);
  }

  filterSpecialties(event: { originalEvent: Event; query: string }) {
    const query = event.query?.toLowerCase() ?? '';
    this.filteredSpecialties = this.specialties.filter(specialty =>
      specialty.name.toLowerCase().includes(query)
    );
  }

  filterLocations(event: { originalEvent: Event; query: string }) {
    const query = event.query?.trim() ?? '';

    if (query.length < 3) {
      this.filteredLocations = []; // avoid firing Nominatim for very short strings
      return;
    }

    this.nominatimService.searchAddress(query).subscribe({
      next: results => {
        this.filteredLocations = results ?? [];
      },
      error: () => {
        this.filteredLocations = []; // silently clear on network error — no UI disruption
      },
    });
  }
}
