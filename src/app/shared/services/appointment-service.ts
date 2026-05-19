import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Appointment } from '../domain/appointment';
import { AppointmentStatus } from '../domain/appointment-status';

export type CreateAppointmentRequestDto = {
  doctorId: number;
  availabilityId: number;
  appointmentNotes?: string | null;
};

export type CreateAppointmentResponseDto = {
  message: string;
};

type BackendAppointmentDto = {
  id: number;
  status: string;
  appointmentNotes?: string | null;
  createdAt?: string | null;
  expiredDateTime?: string | null;
  patientId: number;
  patientFullName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  doctorId: number;
  doctorFullName: string;
  availabilityId: number;
  startTime: string;
  endTime: string;
};

type PagedResultDto<T> = {
  totalCount: number;
  page: number;
  pageSize: number;
  items: T[];
};

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  appointments: Appointment[] = [];

  requestAppointment(dto: CreateAppointmentRequestDto): Observable<CreateAppointmentResponseDto> {
    return this.http.post<CreateAppointmentResponseDto>(`${this.baseUrl}/appointments/request`, dto);
  }

  loadAppointments(): Observable<Appointment[]> {
    return this.http
      .get<PagedResultDto<BackendAppointmentDto>>(`${this.baseUrl}/appointments?page=1&pageSize=200`)
      .pipe(
        map(response => response.items.map(appointment => this.mapBackendAppointment(appointment))),
        tap(appointments => {
          this.appointments = appointments;
        })
      );
  }

  loadAppointmentById(appointmentId: number): Observable<Appointment> {
    return this.http
      .get<BackendAppointmentDto>(`${this.baseUrl}/appointments/${appointmentId}`)
      .pipe(
        map(appointment => this.mapBackendAppointment(appointment)),
        tap(appointment => {
          const index = this.appointments.findIndex(current => current.id === appointment.id);

          if (index === -1) {
            this.appointments.push(appointment);
            return;
          }

          this.appointments[index] = appointment;
        })
      );
  }

  getAppointments(): Appointment[] {
    return this.appointments;
  }

  getAppointmentsByDate(date: string): Appointment[] {
    return this.appointments.filter(appointment => appointment.date === date);
  }

  getAppointmentById(appointmentId: number): Appointment | undefined {
    return this.appointments.find(appointment => appointment.id === appointmentId);
  }

  private mapBackendAppointment(appointment: BackendAppointmentDto): Appointment {
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);

    return {
      id: appointment.id,
      status: this.mapBackendStatus(appointment.status),
      specialty: 'Ιατρός',
      date: this.formatDate(startDate),
      startTime: this.formatTime(startDate),
      endTime: this.formatTime(endDate),

      createdAt: appointment.createdAt ?? null,
      expiredDateTime: appointment.expiredDateTime ?? null,

      patientName: appointment.patientFullName,
      doctorName: appointment.doctorFullName,
      doctorId: appointment.doctorId,
      patientPhone: appointment.patientPhone ?? '-',
      patientEmail: appointment.patientEmail ?? '-',
      patientMessage: appointment.appointmentNotes ?? '',
      conversation: []
    };
  }

  private mapBackendStatus(status: string): AppointmentStatus {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'pending') {
      return 'pending';
    }

    if (normalizedStatus === 'confirmed' || normalizedStatus === 'booked') {
      return 'booked';
    }

    if (normalizedStatus === 'completed') {
      return 'completed';
    }

    return 'rejected';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }
}