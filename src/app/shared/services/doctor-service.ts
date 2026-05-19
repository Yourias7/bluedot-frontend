import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CalendarDay } from '../domain/calendar-day';
import { AvailabilitySlot } from '../domain/availability-slot';
import { Appointment } from '../domain/appointment';
import { Doctor } from '../domain/doctor';
import { AppointmentStatus } from '../domain/appointment-status';
import { SlotStatus } from '../domain/slot-status';

type BackendAppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
type BackendAvailabilityStatus = 'Available' | 'Pending' | 'Booked' | 'Unavailable';

type BackendAppointmentDto = {
  id: number;
  status: BackendAppointmentStatus | string;
  appointmentNotes?: string | null;
  createdAt?: string;
  expiredDateTime?: string | null;
  patientId: number;
  patientFullName: string;
  doctorId: number;
  doctorFullName: string;
  availabilityId: number;
  startTime: string;
  endTime: string;
};

type BackendAvailabilityDto = {
  startTime: string;
  endTime: string;
  status: BackendAvailabilityStatus | string;
  doctorId: number;
};

type UpdateAvailabilityDto = {
  startTime: string;
  endTime: string;
  status: 'Available' | 'Unavailable';
  doctorId: number;
};

type PagedResultDto<T> = {
  totalCount: number;
  page: number;
  pageSize: number;
  items: T[];
};

type AvailabilitySlotWithDoctor = AvailabilitySlot & {
  doctorId: number;
};

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  appointments: Appointment[] = [];

  private slotsByDate: Record<string, AvailabilitySlotWithDoctor[]> = {};

  loadDoctorAppointments(): Observable<Appointment[]> {
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
          const index = this.appointments.findIndex(currentAppointment => currentAppointment.id === appointment.id);

          if (index === -1) {
            this.appointments.push(appointment);
            return;
          }

          this.appointments[index] = appointment;
        })
      );
  }

  loadDoctorAvailabilitySlotsByDate(date: string): Observable<AvailabilitySlot[]> {
    const doctorId = this.getCurrentDoctorIdFromAppointments();

    if (doctorId === null) {
      return throwError(() => new Error('Doctor id is not available yet. Load doctor appointments before loading slots.'));
    }

    return this.http
      .get<BackendAvailabilityDto[]>(`${this.baseUrl}/doctors/${doctorId}/slots?date=${date}`)
      .pipe(
        map(slots => slots.map(slot => this.mapBackendAvailabilitySlot(slot))),
        tap(slots => {
          this.slotsByDate[date] = slots;
        })
      );
  }

  updateDoctorAvailabilitySlot(
    date: string,
    slot: AvailabilitySlot,
    status: 'Available' | 'Unavailable'
  ): Observable<boolean> {
    const slotWithDoctor = slot as AvailabilitySlotWithDoctor;

    const payload: UpdateAvailabilityDto = {
      startTime: `${date}T${slot.startTime}:00`,
      endTime: `${date}T${slot.endTime}:00`,
      status,
      doctorId: slotWithDoctor.doctorId
    };

    return this.http
      .put<void>(`${this.baseUrl}/doctors/me/slots`, payload)
      .pipe(
        tap(() => {
          const cachedSlots = this.slotsByDate[date] ?? [];
          const cachedSlot = cachedSlots.find(currentSlot => currentSlot.id === slot.id);

          if (cachedSlot !== undefined) {
            cachedSlot.status = status === 'Available' ? 'free' : 'disabled';
            cachedSlot.appointmentId = null;
          }
        }),
        map(() => true)
      );
  }

  getDaysWithAvailability(): Observable<CalendarDay[]> {
    return this.loadDoctorAppointments().pipe(
      map(appointments => {
        return appointments.map(appointment => {
          const dateParts = appointment.date.split('-');
          const dayNumber = Number(dateParts[2]);

          return {
            number: dayNumber,
            date: appointment.date,
            hasActivity: appointment.status === 'pending' || appointment.status === 'booked',
            hasPendingAppointment: appointment.status === 'pending',
            hasConfirmedAppointment: appointment.status === 'booked'
          };
        });
      })
    );
  }

  getAppointmentById(appointmentId: number): Appointment | undefined {
    return this.appointments.find(
      appointment => appointment.id === appointmentId
    );
  }

  getDoctorAppointments(): Appointment[] {
    return this.appointments;
  }

  getDoctorAppointmentsByDate(date: string): Appointment[] {
    return this.appointments.filter(appointment => appointment.date === date);
  }

  getPendingAppointmentDates(): string[] {
    return this.appointments
      .filter(appointment => appointment.status === 'pending')
      .map(appointment => appointment.date);
  }

  getBookedAppointmentDates(): string[] {
    return this.appointments
      .filter(appointment => appointment.status === 'booked')
      .map(appointment => appointment.date);
  }

  getDoctorAppointmentById(id: number): Appointment | undefined {
    return this.getAppointmentById(id);
  }

  acceptAppointment(appointmentId: number): Observable<boolean> {
    return this.updateAppointmentStatus(appointmentId, 'Confirmed');
  }

  rejectAppointment(appointmentId: number): Observable<boolean> {
    return this.updateAppointmentStatus(appointmentId, 'Cancelled');
  }

  rejectAppointmentAndDisableSlot(appointmentId: number): Observable<boolean> {
    /*
      Backend behavior:
      PATCH status to Cancelled frees the appointment slot.
      Then the UI can separately disable a free slot from the availability page with PUT /doctors/me/slots.
    */
    return this.updateAppointmentStatus(appointmentId, 'Cancelled');
  }

  getAvailabilitySlotsByDate(date: string): AvailabilitySlot[] {
    return this.slotsByDate[date] ?? [];
  }

  getAvailabilitySlots(): AvailabilitySlot[] {
    return this.getAvailabilitySlotsByDate(this.formatDate(new Date()));
  }

  getTransferSlotsByDate(date: string): AvailabilitySlot[] {
    return this.getAvailabilitySlotsByDate(date).filter(slot => slot.status === 'free');
  }

  transferAppointment(
    appointmentId: number,
    newDate: string,
    newSlot: AvailabilitySlot
  ): Observable<boolean> {
    console.warn('Appointment transfer is not supported by the backend yet.', {
      appointmentId,
      newDate,
      newSlot
    });

    return throwError(() => new Error('Appointment transfer is not supported by the backend yet.'));
  }

  getDoctorProfile(): Doctor | null {
    return null;
  }

  private updateAppointmentStatus(
    appointmentId: number,
    backendStatus: BackendAppointmentStatus
  ): Observable<boolean> {
    return this.http
      .patch<void>(`${this.baseUrl}/appointments/${appointmentId}/status`, {
        status: backendStatus
      })
      .pipe(
        tap(() => {
          const appointment = this.getAppointmentById(appointmentId);

          if (appointment !== undefined) {
            appointment.status = this.mapBackendStatus(backendStatus);
          }
        }),
        map(() => true)
      );
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
      patientName: appointment.patientFullName,
      patientPhone: '-',
      patientEmail: '-',
      patientMessage: appointment.appointmentNotes ?? '',
      conversation: []
    };
  }

  private mapBackendAvailabilitySlot(slot: BackendAvailabilityDto): AvailabilitySlotWithDoctor {
    const startDate = new Date(slot.startTime);
    const endDate = new Date(slot.endTime);
    const date = this.formatDate(startDate);
    const startTime = this.formatTime(startDate);
    const endTime = this.formatTime(endDate);

    const appointment = this.findAppointmentForSlot(date, startTime, endTime);

    return {
      id: startDate.getTime(),
      startTime,
      endTime,
      status: this.mapBackendAvailabilityStatus(slot.status),
      appointmentId: appointment?.id ?? null,
      doctorId: slot.doctorId
    };
  }

  private findAppointmentForSlot(
    date: string,
    startTime: string,
    endTime: string
  ): Appointment | undefined {
    return this.appointments.find(appointment =>
      appointment.date === date &&
      appointment.startTime === startTime &&
      appointment.endTime === endTime &&
      appointment.status !== 'rejected'
    );
  }

  private mapBackendStatus(status: string): AppointmentStatus {
    if (status === 'Pending') {
      return 'pending';
    }

    if (status === 'Confirmed' || status === 'Completed') {
      return 'booked';
    }

    return 'rejected';
  }

  private mapBackendAvailabilityStatus(status: string): SlotStatus {
    if (status === 'Available') {
      return 'free';
    }

    if (status === 'Pending') {
      return 'pending';
    }

    if (status === 'Booked') {
      return 'booked';
    }

    return 'disabled';
  }

  private getCurrentDoctorIdFromAppointments(): number | null {
    const appointmentWithDoctor = this.appointments.find(appointment => appointment.id > 0);

    /*
      The frontend Appointment model does not currently store doctorId.
      We read it from the raw backend appointment only during mapping, so for availability
      we need to get the current doctor id from the JWT as a fallback.
    */
    const tokenDoctorId = this.getUserIdFromJwt();

    if (tokenDoctorId !== null) {
      return tokenDoctorId;
    }

    return appointmentWithDoctor ? 1 : null;
  }

  private getUserIdFromJwt(): number | null {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      const rawId =
        payload.nameid ??
        payload.sub ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      const id = Number(rawId);

      return Number.isNaN(id) ? null : id;
    } catch {
      return null;
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const format = (num: number) => num.toString().padStart(2, '0');

    return `${year}-${format(month)}-${format(day)}`;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const format = (num: number) => num.toString().padStart(2, '0');

    return `${format(hours)}:${format(minutes)}`;
  }
}