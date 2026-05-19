import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { CalendarDay } from '../domain/calendar-day';
import { AvailabilitySlot } from '../domain/availability-slot';
import { Appointment } from '../domain/appointment';
import { Doctor } from '../domain/doctor';
import { AppointmentStatus } from '../domain/appointment-status';

type BackendAppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

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

type PagedResultDto<T> = {
  totalCount: number;
  page: number;
  pageSize: number;
  items: T[];
};

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  doctorProfile: Doctor = {
    id: 1,
    firstName: 'Doctor',
    lastName: 'One',
    email: 'doctor1@example.com',
    password: 'password123',
    role: 'doctor' as any,
    bio: 'Καρδιολόγος με εμπειρία στην πρόληψη και παρακολούθηση καρδιαγγειακών παθήσεων.',
    clinicAddress: 'Λεωφόρος Συγγρού 100, Αθήνα',
    phoneNumber: '2101234567',
    yearsOfExperience: 8,
    specialty: {
      id: 1,
      name: 'Καρδιολόγος'
    }
  };

  appointments: Appointment[] = [];

  getDoctors(): Doctor[] {
    return [];
  }

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

  getDaysWithAvailability(): Observable<CalendarDay[]> {
    const daysWithAppointments = this.appointments.map(appointment => {
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

    return of(daysWithAppointments);
  }

  getAvailabilitySlots(): AvailabilitySlot[] {
    return this.getAvailabilitySlotsByDate(this.formatDate(new Date()));
  }

  getAvailabilitySlotsByDate(date: string): AvailabilitySlot[] {
    const baseSlots: AvailabilitySlot[] = [
      {
        id: 1,
        startTime: '10:00',
        endTime: '11:00',
        status: 'free',
        appointmentId: null
      },
      {
        id: 2,
        startTime: '11:00',
        endTime: '12:00',
        status: 'free',
        appointmentId: null
      },
      {
        id: 3,
        startTime: '12:00',
        endTime: '13:00',
        status: 'free',
        appointmentId: null
      },
      {
        id: 4,
        startTime: '13:00',
        endTime: '14:00',
        status: 'free',
        appointmentId: null
      },
      {
        id: 5,
        startTime: '14:00',
        endTime: '15:00',
        status: 'free',
        appointmentId: null
      },
      {
        id: 6,
        startTime: '15:00',
        endTime: '16:00',
        status: 'free',
        appointmentId: null
      },
      {
        id: 7,
        startTime: '16:00',
        endTime: '17:00',
        status: 'free',
        appointmentId: null
      },
      {
        id: 8,
        startTime: '17:00',
        endTime: '18:00',
        status: 'free',
        appointmentId: null
      }
    ];

    return baseSlots.map(slot => {
      const appointment = this.appointments.find(currentAppointment =>
        currentAppointment.date === date &&
        currentAppointment.startTime === slot.startTime &&
        currentAppointment.endTime === slot.endTime &&
        currentAppointment.status !== 'rejected'
      );

      if (appointment === undefined) {
        return slot;
      }

      return {
        ...slot,
        status: appointment.status === 'pending' ? 'pending' : 'booked',
        appointmentId: appointment.id
      };
    });
  }

  getAppointmentById(appointmentId: number): Appointment | undefined {
    return this.appointments.find(
      appointment => appointment.id === appointmentId
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

  restoreRejectedAppointment(appointmentId: number): Observable<boolean> {
    /*
      The backend currently does not allow doctors to set status back to Pending.
      So keep this as frontend-only for now.
    */
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return of(false);
    }

    appointment.status = 'pending';

    return of(true);
  }

  rejectAppointmentAndDisableSlot(appointmentId: number): Observable<boolean> {
    /*
      First backend step: reject/cancel the appointment.
      Later we can also call PUT /api/doctors/me/slots to disable the slot.
    */
    return this.updateAppointmentStatus(appointmentId, 'Cancelled');
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
    /*
      Backend does not currently expose an appointment transfer endpoint.
      Keep this frontend-only until backend supports changing availabilityId.
    */
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return of(false);
    }

    appointment.date = newDate;
    appointment.startTime = newSlot.startTime;
    appointment.endTime = newSlot.endTime;
    appointment.status = 'booked';

    return of(true);
  }

  getDoctorProfile(): Doctor {
    return this.doctorProfile;
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

  private mapBackendStatus(status: string): AppointmentStatus {
    if (status === 'Pending') {
      return 'pending';
    }

    if (status === 'Confirmed' || status === 'Completed') {
      return 'booked';
    }

    return 'rejected';
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