import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type CreateAppointmentRequestDto = {
  doctorId: number;
  availabilityId: number;
  appointmentNotes?: string | null;
};

export type CreateAppointmentResponseDto = {
  message: string;
};

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  requestAppointment(dto: CreateAppointmentRequestDto): Observable<CreateAppointmentResponseDto> {
    return this.http.post<CreateAppointmentResponseDto>(`${this.baseUrl}/appointments/request`, dto);
  }
}
