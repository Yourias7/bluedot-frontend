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
  // Point to your local C# API
  private apiUrl = 'https://localhost:7092/api/locations'; 

  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<LocationSuggestion[]> {
    return this.http.get<LocationSuggestion[]>(`${this.apiUrl}/suggest?query=${encodeURIComponent(query)}`);
  }
}