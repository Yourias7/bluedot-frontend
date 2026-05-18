import { AfterViewInit, Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Doctor } from '../../../shared/domain/doctor';
import { Specialty } from '../../../shared/domain/specialty';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Router, RouterLink } from '@angular/router';
import { Avatar, AvatarModule } from 'primeng/avatar';
import { RatingModule } from 'primeng/rating';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-map-layout',
  imports: [CommonModule, AvatarModule, RatingModule, AutoCompleteModule, FormsModule],
  templateUrl: './map-layout.html',
  styleUrls: ['./map-layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapLayout implements AfterViewInit {

  selectedDoctor?:Doctor;
  zoomLevel:number = 14;
  private map!: L.Map
  private userMarker?: L.CircleMarker;
  private userAccuracyCircle?: L.Circle;
  private doctorMarkers: L.Marker[] = [];
  userLocationError: string | null = null;
  doctorLoadError: string | null = null;
  sidebarOpen = false;
  review:number = 3;

  // Default fallback view if user denies / geolocation fails (centered on Greece)
  private readonly defaultCenter: L.LatLngTuple = [38.0, 23.8];
  private readonly defaultZoom = 6;
  private readonly userZoom = 14;

  specialties: Specialty[] = [];
  filteredSpecialties: Specialty[] = [];
  selectedSpecialty: Specialty | string | null = null;

  locations: string[] = [
    'Αθήνα',
    'Θεσσαλονίκη',
    'Πάτρα',
    'Ηράκλειο',
    'Λάρισα'
  ];

  filteredLocations: string[] = [];
  selectedLocation?: string;

  private readonly doctorIcon: L.DivIcon = L.divIcon({
    className: 'doctor-marker',
    html:
      '<div style="' +
      'width:24px;height:24px;' +
      'background:#dc2626;' +
      'border:2px solid #ffffff;' +
      'border-radius:50% 50% 50% 0;' +
      'transform:rotate(-45deg);' +
      'box-shadow:0 2px 6px rgba(0,0,0,0.35);' +
      '"></div>',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });

  constructor(private cdf: ChangeDetectorRef, private searchService:DoctorSearchService, private router:Router) {

  }

  ngAfterViewInit(): void {
    this.initMap();
    this.locateUser();
    this.loadSpecialties();
    this.loadDoctors();
  }

  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map').setView(this.defaultCenter, this.defaultZoom);
    L.tileLayer(baseMapURl).addTo(this.map);
  }

  private loadSpecialties() {
    this.searchService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties ?? [];
        this.cdf.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load specialties:', error);
      }
    });
  }

  private loadDoctors(specialtyId?: number | null) {
    this.doctorLoadError = null;

    this.searchService.searchDoctors(specialtyId).subscribe({
      next: (doctors) => {
        this.renderDoctorMarkers(doctors ?? []);
        this.cdf.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load doctors:', error);
        this.doctorLoadError = 'Αποτυχία φόρτωσης ιατρών.';
        this.cdf.detectChanges();
      }
    });
  }

  private renderDoctorMarkers(doctors: Doctor[]) {
    this.clearDoctorMarkers();

    for (const doctor of doctors) {
      if (
        doctor.latitude === undefined || doctor.latitude === null ||
        doctor.longitude === undefined || doctor.longitude === null
      ) {
        continue;
      }

      const marker = L.marker([doctor.latitude, doctor.longitude], {
        icon: this.doctorIcon
      });

      marker.addTo(this.map);
      marker.on('click', () => this.onDoctorMarkerClick(doctor));

      this.doctorMarkers.push(marker);
    }
  }

  private clearDoctorMarkers() {
    for (const marker of this.doctorMarkers) {
      marker.remove();
    }
    this.doctorMarkers = [];
  }

  private onDoctorMarkerClick(doctor: Doctor) {
    if (
      doctor.latitude !== undefined && doctor.latitude !== null &&
      doctor.longitude !== undefined && doctor.longitude !== null
    ) {
      this.map.setView([doctor.latitude, doctor.longitude], this.zoomLevel);
    }
    this.openDoctorSidebar(doctor);
  }

  private resolveSelectedSpecialtyId(): number | null {
    const value = this.selectedSpecialty;

    if (value && typeof value === 'object') {
      return value.id ?? null;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const needle = value.trim().toLowerCase();
      const match = this.specialties.find(
        specialty => specialty.name.toLowerCase() === needle
      );
      return match?.id ?? null;
    }

    return null;
  }

  applySpecialtyFilter() {
    const specialtyId = this.resolveSelectedSpecialtyId();
    this.loadDoctors(specialtyId);
  }

  private locateUser() {
    if (!('geolocation' in navigator)) {
      this.userLocationError = 'Ο περιηγητής σας δεν υποστηρίζει γεωεντοπισμό.';
      this.cdf.detectChanges();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        this.showUserOnMap(latitude, longitude, accuracy);
        this.userLocationError = null;
        this.cdf.detectChanges();
      },
      (error) => {
        this.userLocationError = this.getGeolocationErrorMessage(error);
        console.warn('Geolocation error:', error);
        this.cdf.detectChanges();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  private showUserOnMap(lat: number, lng: number, accuracyMeters: number) {
    if (!this.map) {
      return;
    }

    const userLatLng = L.latLng(lat, lng);

    if (this.userMarker) {
      this.userMarker.setLatLng(userLatLng);
    } else {
      this.userMarker = L.circleMarker(userLatLng, {
        radius: 8,
        color: '#1d4ed8',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 1
      })
        .addTo(this.map)
        .bindPopup('Η τοποθεσία μου');
    }

    if (this.userAccuracyCircle) {
      this.userAccuracyCircle.setLatLng(userLatLng).setRadius(accuracyMeters);
    } else {
      this.userAccuracyCircle = L.circle(userLatLng, {
        radius: accuracyMeters,
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.15
      }).addTo(this.map);
    }

    this.map.setView(userLatLng, this.userZoom);
  }

  private getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Δεν δόθηκε άδεια πρόσβασης στην τοποθεσία σας.';
      case error.POSITION_UNAVAILABLE:
        return 'Η τοποθεσία σας δεν είναι διαθέσιμη αυτή τη στιγμή.';
      case error.TIMEOUT:
        return 'Έληξε το χρονικό όριο εντοπισμού της τοποθεσίας σας.';
      default:
        return 'Δεν ήταν δυνατός ο εντοπισμός της τοποθεσίας σας.';
    }
  }

  openDoctorSidebar(doctor: Doctor) {
    this.selectedDoctor = doctor;
    this.sidebarOpen = true;
    this.cdf.detectChanges();
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  filterSpecialties(event: { originalEvent: Event; query: string }) {
    const query = event.query?.toLowerCase() ?? '';
    this.filteredSpecialties = this.specialties.filter(
      specialty => specialty.name.toLowerCase().includes(query)
    );
  }

  filterLocations(event: { originalEvent: Event; query: string }) {
    const query = event.query?.toLowerCase() ?? '';
    this.filteredLocations = this.locations.filter(item => item.toLowerCase().includes(query));
  }

  showDoctorInfo(id: number | undefined) {
    if (id === undefined) {
      return;
    }
    this.router.navigate(['/doctor-details', id]);
  }
}
