import { Injectable } from '@angular/core';
import { CalendarDay } from '../domain/calendar-day';
import { Observable, of } from 'rxjs';
import { AvailabilitySlot } from '../domain/availability-slot';
import { Appointment } from '../domain/appointment';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  getDaysWithAvailability(): Observable<CalendarDay[]> {
    return of([
      { number: 1, date: '2025-09-01', hasActivity: false },
      { number: 2, date: '2025-09-02', hasActivity: false },
      { number: 3, date: '2025-09-03', hasActivity: false },
      { number: 4, date: '2025-09-04', hasActivity: false },
      { number: 5, date: '2025-09-05', hasActivity: false },
      { number: 6, date: '2025-09-06', hasActivity: false },
      { number: 7, date: '2025-09-07', hasActivity: false },
      { number: 8, date: '2025-09-08', hasActivity: false },
      { number: 9, date: '2025-09-09', hasActivity: true },
      { number: 10, date: '2025-09-10', hasActivity: false },
      { number: 11, date: '2025-09-11', hasActivity: false },
      { number: 12, date: '2025-09-12', hasActivity: false },
      { number: 13, date: '2025-09-13', hasActivity: true },
      { number: 14, date: '2025-09-14', hasActivity: false },
      { number: 15, date: '2025-09-15', hasActivity: false },
      { number: 16, date: '2025-09-16', hasActivity: false },
      { number: 17, date: '2025-09-17', hasActivity: false },
      { number: 18, date: '2025-09-18', hasActivity: false },
      { number: 19, date: '2025-09-19', hasActivity: false },
      { number: 20, date: '2025-09-20', hasActivity: false },
      { number: 21, date: '2025-09-21', hasActivity: false },
      { number: 22, date: '2025-09-22', hasActivity: false },
      { number: 23, date: '2025-09-23', hasActivity: false },
      { number: 24, date: '2025-09-24', hasActivity: false },
      { number: 25, date: '2025-09-25', hasActivity: false },
      { number: 26, date: '2025-09-26', hasActivity: false },
      { number: 27, date: '2025-09-27', hasActivity: false },
      { number: 28, date: '2025-09-28', hasActivity: false },
      { number: 29, date: '2025-09-29', hasActivity: false },
      { number: 30, date: '2025-09-30', hasActivity: false }
    ]);
  }
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
      date: 'Τρίτη 24/5/26',
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
      date: 'Τρίτη 24/5/26',
      startTime: '12:00',
      endTime: '13:00',
      patientName: 'Διδώ Ακριβοπούλου',
      patientPhone: '2103321456',
      patientEmail: 'asthp@gmail.com',
      patientMessage:
        'Καλησπέρα σας, θα ήθελα να σας ενημερώσω ότι θα μεταφέρω το ραντεβού μου ένα τέταρτο μετά.',
      conversation: [
        {
          sender: 'patient',
          text: 'Καλησπέρα σας, θα ήθελα να σας ενημερώσω ότι θα μεταφέρω το ραντεβού μου ένα τέταρτο μετά.',
          sentAt: 'Παραδόθηκε 23/5/26, 12:00'
        },
        {
          sender: 'doctor',
          text: 'Καλησπέρα σας! Ευχαριστώ για την ενημέρωση.',
          sentAt: 'Εστάλη 23/5/26, 12:05'
        }
      ]
    },
    {
      id: 91,
      status: 'pending',
      specialty: 'Καρδιολόγος',
      date: 'Τρίτη 24/5/26',
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
      date: 'Τρίτη 24/5/26',
      startTime: '17:00',
      endTime: '18:00',
      patientName: 'Νίκος Νικολάου',
      patientPhone: '2110000000',
      patientEmail: 'nikos@gmail.com',
      patientMessage: 'Έχω ήδη επιβεβαιωμένο ραντεβού.',
      conversation: []
    }
  ];

  getAvailabilitySlots(): AvailabilitySlot[] {
    return this.availabilitySlots;
  }

  getAppointmentById(appointmentId: number): Appointment | undefined {
    return this.appointments.find(
      appointment => appointment.id === appointmentId
    );
  }

  acceptAppointment(appointmentId: number) {
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return;
    }

    appointment.status = 'booked';

    const slot = this.availabilitySlots.find(
      slot => slot.appointmentId === appointmentId
    );

    if (slot !== undefined) {
      slot.status = 'booked';
    }
    return of(true);
  }

  rejectAppointment(appointmentId: number) {
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return;
    }

    appointment.status = 'rejected';

    const slot = this.availabilitySlots.find(
      slot => slot.appointmentId === appointmentId
    );

    if (slot !== undefined) {
      slot.status = 'free';
      slot.appointmentId = null;
    }
    return of(true);
  }

  rejectAppointmentAndDisableSlot(appointmentId: number): Observable<boolean> {
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment) {
      appointment.status = 'rejected';

      const slot = this.availabilitySlots.find(
        slot => slot.appointmentId === appointmentId
      );

      if (slot !== undefined) {
        slot.status = 'disabled';
        slot.appointmentId = null;
      }
    }
    return of(true);
  }
}

