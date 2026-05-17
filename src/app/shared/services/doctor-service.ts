import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { CalendarDay } from '../domain/calendar-day';
import { AvailabilitySlot } from '../domain/availability-slot';
import { Appointment } from '../domain/appointment';
import { Doctor } from '../domain/doctor';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  getDoctors(): Doctor[] {
    /*
      Temporary placeholder.
      Later this can return real doctors from the backend.
    */
    return [];
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

  availabilitySlots: AvailabilitySlot[] = [
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
      status: 'pending',
      appointmentId: 45
    },
    {
      id: 3,
      startTime: '12:00',
      endTime: '13:00',
      status: 'booked',
      appointmentId: 82
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
      status: 'disabled',
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
      status: 'pending',
      appointmentId: 91
    },
    {
      id: 8,
      startTime: '17:00',
      endTime: '18:00',
      status: 'booked',
      appointmentId: 92
    }
  ];

  appointments: Appointment[] = [
    {
      id: 45,
      status: 'pending',
      specialty: 'Καρδιολόγος',
      date: '2026-05-24',
      startTime: '11:00',
      endTime: '12:00',
      patientName: 'Ασθενής Ασθενόπουλος',
      patientPhone: '2103321456',
      patientEmail: 'asthp@gmail.com',
      patientMessage:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra dapibus leo. In at interdum lectus. Duis eget sagittis mauris, ac vehicula turpis.',
      conversation: []
    },
    {
      id: 82,
      status: 'booked',
      specialty: 'Καρδιολόγος',
      date: '2026-05-24',
      startTime: '12:00',
      endTime: '13:00',
      patientName: 'Διδώ Ακριβοπούλου',
      patientPhone: '2103321456',
      patientEmail: 'asthp@gmail.com',
      patientMessage:
        'Καλησπέρα σας, θα ήθελα να σας ενημερώσω ότι θα μεταφέρω το ραντεβού μου ένα τέταρτο μετά.',
      conversation: []
    },
    {
      id: 91,
      status: 'pending',
      specialty: 'Καρδιολόγος',
      date: '2026-05-24',
      startTime: '16:00',
      endTime: '17:00',
      patientName: 'Μαρία Παπαδοπούλου',
      patientPhone: '2100000000',
      patientEmail: 'maria@gmail.com',
      patientMessage: 'Θα ήθελα να κλείσω ραντεβού για έναν έλεγχο.',
      conversation: []
    },
    {
      id: 92,
      status: 'booked',
      specialty: 'Καρδιολόγος',
      date: '2026-05-24',
      startTime: '17:00',
      endTime: '18:00',
      patientName: 'Νίκος Νικολάου',
      patientPhone: '2110000000',
      patientEmail: 'nikos@gmail.com',
      patientMessage: 'Έχω ήδη επιβεβαιωμένο ραντεβού.',
      conversation: []
    },
    {
      id: 93,
      status: 'rejected',
      specialty: 'Καρδιολόγος',
      date: '2026-05-24',
      startTime: '18:00',
      endTime: '19:00',
      patientName: 'Άννα Ιωάννου',
      patientPhone: '2101111111',
      patientEmail: 'anna@gmail.com',
      patientMessage: 'Θα ήθελα να κλείσω ραντεβού για έλεγχο.',
      conversation: []
    }
  ];

  getAvailabilitySlots(): AvailabilitySlot[] {
    return this.availabilitySlots;
  }

  getAvailabilitySlotsByDate(date: string): AvailabilitySlot[] {
    /*
      For now, this builds the visible day schedule from the mock appointments.
      Later, this method can become:
      GET /api/Doctors/{doctorId}/slots?date=YYYY-MM-DD

      The component will not need to change.
    */

    console.log('Loading availability slots for date:', date);

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
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return of(false);
    }

    appointment.status = 'booked';

    return of(true);
  }

  rejectAppointment(appointmentId: number): Observable<boolean> {
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return of(false);
    }

    appointment.status = 'rejected';

    return of(true);
  }

  restoreRejectedAppointment(appointmentId: number): Observable<boolean> {
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return of(false);
    }

    appointment.status = 'pending';

    return of(true);
  }

  rejectAppointmentAndDisableSlot(appointmentId: number): Observable<boolean> {
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return of(false);
    }

    appointment.status = 'rejected';

    /*
      Later this should also call/update the backend availability endpoint.
      For now, the appointment becomes rejected.
    */

    return of(true);
  }

  getTransferSlotsByDate(date: string): AvailabilitySlot[] {
    /*
      Temporary mock logic.

      Later this can become:
      GET /api/Doctors/{doctorId}/slots?date=YYYY-MM-DD

      The modal will already be ready, because it calls this method
      every time the doctor selects a new transfer date.
    */

    return this.getAvailabilitySlotsByDate(date).filter(slot => slot.status === 'free');
  }

  transferAppointment(
    appointmentId: number,
    newDate: string,
    newSlot: AvailabilitySlot
  ): Observable<boolean> {
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
}