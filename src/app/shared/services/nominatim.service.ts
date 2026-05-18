import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LocationSuggestion {
  displayName: string;
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root'
})
export class NominatimService {
  // Point directly to your locally hosted C# Web API instance
  private apiUrl = 'https://localhost:5228/api/locations'; 

  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<any[]> {
    // Call your backend instead of the third-party public server
    return this.http.get<any[]>(`${this.apiUrl}/suggest?query=${encodeURIComponent(query)}`);
  }
}