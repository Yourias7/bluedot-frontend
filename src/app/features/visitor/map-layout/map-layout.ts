import { AfterViewInit, Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Doctor } from '../../../shared/domain/doctor';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';

interface MarkerData {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

@Component({
  selector: 'app-map-layout',
  imports: [CommonModule],
  templateUrl: './map-layout.html',
  styleUrls: ['./map-layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapLayout implements AfterViewInit {

  selectedDoctor?:Doctor;

  private map!: L.Map
  sidebarOpen = false;
  selectedMarker: MarkerData | null = null;

  markers: L.Marker[] = [
    L.marker([23.7771, 90.3994]),
    L.marker([23.8, 90.6]) // Dhaka, Bangladesh
  ];

  markerData: { [key: number]: MarkerData } = {
    0: {
      name: 'Dhaka Medical Center',
      lat: 23.7771,
      lng: 90.3994,
      description: 'A leading medical facility in Dhaka offering comprehensive healthcare services.'
    }
  };

  constructor(private cdf: ChangeDetectorRef, private searchService:DoctorSearchService) {

  }

 
  ngAfterViewInit(): void {
    this.initMap();
    this.centerMap();
  }


  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }


  private centerMap() {
    // Create a boundary based on the markers
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));

    // Fit the map into the boundary
    this.map.fitBounds(bounds);

    // Add click listeners to markers
    this.markers.forEach((marker, index) => {
      marker.addTo(this.map);
      marker.addEventListener('click', () => {
        this.openSidebar(index);
      });
    });
  }

  openSidebar(markerIndex: number) {
    this.selectedMarker = this.markerData[markerIndex];
    this.sidebarOpen = true;
    this.selectedDoctor = this.searchService.getDoctorById(0);
    this.cdf.detectChanges();
    console.log('sidebar open', this.markerData.valueOf());
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.selectedMarker = null;
  }
}
