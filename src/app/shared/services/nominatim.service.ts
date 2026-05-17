import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface NominatimResponse {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({
  providedIn: 'root'
})
export class NominatimService {
  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<NominatimResponse[]> {
    if (!query || query.length < 3) {
      return of([]);
    }
    // Nominatim requires a user-agent or identifier; Angular's HttpClient handles standard headers, 
    // but keep in mind Nominatim's acceptable use policy for heavy production usage.
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    
    return this.http.get<NominatimResponse[]>(url).pipe(
      catchError(error => {
        console.error('Nominatim API error:', error);
        return of([]);
      })
    );
  }
}