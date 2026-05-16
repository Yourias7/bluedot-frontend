import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

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
  styleUrl: './map-layout.scss',
})
export class MapLayout implements OnInit, AfterViewInit {

  private map!: L.Map
  sidebarOpen = false;
  selectedMarker: MarkerData | null = null;
  
  markers: L.Marker[] = [
    L.marker([23.7771, 90.3994]) // Dhaka, Bangladesh
  ];
  
  markerData: { [key: number]: MarkerData } = {
    0: {
      name: 'Dhaka Medical Center',
      lat: 23.7771,
      lng: 90.3994,
      description: 'A leading medical facility in Dhaka offering comprehensive healthcare services.'
    }
  };
  
  constructor() {

  }

  ngOnInit(): void {
    
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
      marker.addTo(this.map).addEventListener('click', () => {
        this.openSidebar(index);
      });
    });
  }

  openSidebar(markerIndex: number) {
    this.selectedMarker = this.markerData[markerIndex];
    this.sidebarOpen = true;
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.selectedMarker = null;
  }
}
