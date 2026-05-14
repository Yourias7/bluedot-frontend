import { Injectable } from '@angular/core';

export type SlotStatus = 'free' | 'pending' | 'booked' | 'disabled';

export type AppointmentStatus = 'pending' | 'booked' | 'rejected';

export type AvailabilitySlot = {
  id: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  appointmentId: number | null;
};

export type ChatMessage = {
  sender: 'doctor' | 'patient';
  text: string;
  sentAt: string;
};

export type Appointment = {
  id: number;
  status: AppointmentStatus;

  specialty: string;
  date: string;
  startTime: string;
  endTime: string;

  patientName: string;
  patientPhone: string;
  patientEmail: string;

  patientMessage: string;

  conversation: ChatMessage[];
};

@Injectable({
  providedIn: 'root'
})
export class DoctorFakeDataService {
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

    /*
      TEMPORARY FRONTEND-ONLY LOGIC.

      Later this should call the backend, for example:
      PATCH /api/appointments/{appointmentId}/accept

      The backend/database should update:
      - Appointment.Status = booked
      - Availability status/equivalent = booked
    */
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

    /*
      TEMPORARY FRONTEND-ONLY LOGIC.

      Later this should call the backend, for example:
      PATCH /api/appointments/{appointmentId}/reject

      This version rejects the appointment and makes the slot free again.
    */
  }

  rejectAppointmentAndDisableSlot(appointmentId: number) {
    const appointment = this.getAppointmentById(appointmentId);

    if (appointment === undefined) {
      return;
    }

    appointment.status = 'rejected';

    const slot = this.availabilitySlots.find(
      slot => slot.appointmentId === appointmentId
    );

    if (slot !== undefined) {
      slot.status = 'disabled';
      slot.appointmentId = null;
    }

    /*
      TEMPORARY FRONTEND-ONLY LOGIC.

      Later this should call the backend, for example:
      PATCH /api/appointments/{appointmentId}/reject-and-disable-slot

      This version rejects the appointment and disables the related slot.
    */
  }
}