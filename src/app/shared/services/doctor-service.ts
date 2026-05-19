import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AppointmentService } from './appointment-service';
import { CalendarDay } from '../domain/calendar-day';
import { AvailabilitySlot } from '../domain/availability-slot';
import { Appointment } from '../domain/appointment';
import { Doctor } from '../domain/doctor';
import { AppointmentStatus } from '../domain/appointment-status';
import { SlotStatus } from '../domain/slot-status';

type BackendAppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
type BackendAvailabilityStatus = 'Available' | 'Pending' | 'Booked' | 'Unavailable';

type BackendSpecialtyDto = {
  name?: string;
  Name?: string;
};

type BackendAppointmentDto = {
  id: number;
  status: BackendAppointmentStatus | string;
  appointmentNotes?: string | null;
  createdAt?: string;
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
  specialties?: (string | BackendSpecialtyDto)[];
  Specialties?: (string | BackendSpecialtyDto)[];
  doctorSpecialties?: (string | BackendSpecialtyDto)[];
  DoctorSpecialties?: (string | BackendSpecialtyDto)[];
};

type BackendAvailabilitySlotDto = {
  id?: number;
  Id?: number;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  status?: string | number;
  Status?: string | number;
  appointmentId?: number | null;
  AppointmentId?: number | null;
  date?: string;
  Date?: string;
};

type BackendAvailabilityDto = {
  id?: number;
  Id?: number;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  status?: BackendAvailabilityStatus | string | number;
  Status?: BackendAvailabilityStatus | string | number;
  doctorId?: number;
  DoctorId?: number;
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
  private appointmentService = inject(AppointmentService);
  private baseUrl = environment.apiUrl;

  appointments: Appointment[] = [];

  private slotsByDate: Record<string, AvailabilitySlotWithDoctor[]> = {};

  loadDoctorAppointments(): Observable<Appointment[]> {
    return this.appointmentService.loadAppointments().pipe(
      tap(appointments => {
        this.appointments = appointments;
      })
    );
  }

  loadAppointmentById(appointmentId: number): Observable<Appointment> {
    return this.appointmentService.loadAppointmentById(appointmentId).pipe(
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
        map(slots => slots.map((slot, index) => this.mapBackendAvailabilitySlot(slot, index))),
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

  loadAvailableSlotsForDoctor(doctorId: number, date: string): Observable<AvailabilitySlot[]> {
    return this.http
      .get<BackendAvailabilitySlotDto[] | { items: BackendAvailabilitySlotDto[] }>(
        `${this.baseUrl}/doctors/${doctorId}/slots?date=${date}`
      )
      .pipe(
        tap(response => console.debug('[DoctorService] /doctors/{id}/slots raw response:', response)),
        map(response => {
          const items = Array.isArray(response) ? response : response.items ?? [];

          const mapped = items.map((slot, index) => this.mapBackendSlot(slot, index));

          console.debug('[DoctorService] mapped slots:', mapped);

          return mapped.filter(slot => slot.status === 'free');
        })
      );
  }

  transferAppointment(
    appointmentId: number,
    newDate: string,
    newSlot: AvailabilitySlot
  ): Observable<boolean> {
    if (newSlot.id <= 0) {
      return throwError(() => new Error('The selected slot does not have a valid backend availability id.'));
    }

    return this.http
      .patch<void>(`${this.baseUrl}/appointments/${appointmentId}/slot`, {
        newAvailabilityId: newSlot.id
      })
      .pipe(
        tap(() => {
          const appointment = this.getAppointmentById(appointmentId);

          if (appointment !== undefined) {
            appointment.date = newDate;
            appointment.startTime = newSlot.startTime;
            appointment.endTime = newSlot.endTime;
            appointment.status = 'booked';
          }

          Object.keys(this.slotsByDate).forEach(date => {
            this.slotsByDate[date] = [];
          });
        }),
        map(() => true)
      );
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
    const specialties = this.mapSpecialties(appointment);

    return {
      id: appointment.id,
      status: this.mapBackendStatus(appointment.status),
      specialties,
      specialty: specialties.length > 0 ? specialties.join(', ') : 'Ιατρός',
      date: this.formatDate(startDate),
      startTime: this.formatTime(startDate),
      endTime: this.formatTime(endDate),

      doctorName: appointment.doctorFullName,
      doctorId: appointment.doctorId,

      patientName: appointment.patientFullName,
      patientPhone: appointment.patientPhone ?? '-',
      patientEmail: appointment.patientEmail ?? '-',
      patientMessage: appointment.appointmentNotes ?? '',
      conversation: []
    };
  }

  private mapSpecialties(appointment: BackendAppointmentDto): string[] {
    const raw =
      appointment.specialties ??
      appointment.Specialties ??
      appointment.doctorSpecialties ??
      appointment.DoctorSpecialties;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map(item => {
        if (typeof item === 'string') {
          return item.trim();
        }

        return (item.name ?? item.Name ?? '').trim();
      })
      .filter(name => name.length > 0);
  }

  private mapBackendSlot(slot: BackendAvailabilitySlotDto, index: number): AvailabilitySlot {
    const id = slot.id ?? slot.Id ?? index;
    const startTime = slot.startTime ?? slot.StartTime ?? '';
    const endTime = slot.endTime ?? slot.EndTime ?? '';
    const rawStatus = slot.status ?? slot.Status;
    const appointmentId = slot.appointmentId ?? slot.AppointmentId ?? null;

    return {
      id: id,
      startTime: this.normalizeTime(startTime),
      endTime: this.normalizeTime(endTime),
      status: this.mapBackendSlotStatus(rawStatus),
      appointmentId: appointmentId
    };
  }

  private mapBackendSlotStatus(status: string | number | undefined | null): AvailabilitySlot['status'] {
    if (status === undefined || status === null) {
      return 'free';
    }

    if (typeof status === 'number') {
      if (status === 0) return 'free';
      if (status === 1) return 'pending';
      if (status === 2) return 'booked';
      return 'disabled';
    }

    const normalized = status.toLowerCase();

    if (normalized === 'free' || normalized === 'available') {
      return 'free';
    }

    if (normalized === 'pending') {
      return 'pending';
    }

    if (normalized === 'booked' || normalized === 'confirmed') {
      return 'booked';
    }

    if (normalized === 'disabled' || normalized === 'unavailable') {
      return 'disabled';
    }

    return 'free';
  }

  private normalizeTime(value: string): string {
    if (!value) {
      return value;
    }

    if (value.includes('T')) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return this.formatTime(date);
      }
    }

    if (value.length >= 5 && value[2] === ':') {
      return value.substring(0, 5);
    }

    return value;
  }

  private mapBackendAvailabilitySlot(slot: BackendAvailabilityDto, index: number): AvailabilitySlotWithDoctor {
    const rawId = slot.id ?? slot.Id;
    const rawStartTime = slot.startTime ?? slot.StartTime ?? '';
    const rawEndTime = slot.endTime ?? slot.EndTime ?? '';
    const rawStatus = slot.status ?? slot.Status;
    const rawDoctorId = slot.doctorId ?? slot.DoctorId ?? 0;

    const startDate = new Date(rawStartTime);
    const endDate = new Date(rawEndTime);

    const date = this.formatDate(startDate);
    const startTime = this.formatTime(startDate);
    const endTime = this.formatTime(endDate);

    const appointment = this.findAppointmentForSlot(date, startTime, endTime);

    const fallbackId = -(index + 1);

    return {
      id: rawId ?? fallbackId,
      startTime,
      endTime,
      status: appointment !== undefined
        ? this.mapAppointmentStatusToSlotStatus(appointment.status)
        : this.mapBackendAvailabilityStatus(rawStatus),
      appointmentId: appointment?.id ?? null,
      doctorId: rawDoctorId
    };
  }

  private mapAppointmentStatusToSlotStatus(status: AppointmentStatus): SlotStatus {
    if (status === 'pending') {
      return 'pending';
    }

    if (status === 'booked') {
      return 'booked';
    }

    return 'free';
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

  private mapBackendAvailabilityStatus(status: string | number | undefined | null): SlotStatus {
    if (status === undefined || status === null) {
      return 'free';
    }

    if (typeof status === 'number') {
      if (status === 0) {
        return 'free';
      }

      if (status === 1) {
        return 'booked';
      }

      if (status === 2) {
        return 'disabled';
      }

      if (status === 3) {
        return 'pending';
      }

      return 'disabled';
    }

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'available' || normalizedStatus === 'free') {
      return 'free';
    }

    if (normalizedStatus === 'pending') {
      return 'pending';
    }

    if (normalizedStatus === 'booked' || normalizedStatus === 'confirmed') {
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