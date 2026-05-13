import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

type AppointmentStatus = 'pending' | 'booked' | 'rejected';

type ChatMessage = {
  sender: 'doctor' | 'patient';
  text: string;
  sentAt: string;
};

type Appointment = {
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

@Component({
  selector: 'app-doctor-appointment-details-page',
  imports: [],
  templateUrl: './doctor-appointment-details-page.html',
  styleUrl: './doctor-appointment-details-page.scss'
})
export class DoctorAppointmentDetailsPage {
rejectAppointmentAndDisableSlot() {
throw new Error('Method not implemented.');
}
  appointmentId: string | null = null;
  appointment: Appointment | undefined;

  appointments: Appointment[] = [
    {
      id: 45,
      status: 'pending',
      specialty: 'Καρδιολόγος',
      date: 'Τρίτη 24/5/26',
      startTime: '10:30',
      endTime: '11:30',
      patientName: 'Ασθενής Ασθενόπουλος',
      patientPhone: '2103321456',
      patientEmail: 'asthp@gmail.com',
      patientMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra dapibus leo. In at interdum lectus. Duis eget sagittis mauris, ac vehicula turpis.',
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
      patientMessage: 'Καλησπέρα σας, θα ήθελα να σας ενημερώσω ότι θα μεταφέρω το ραντεβού μου ένα τέταρτο μετά.',
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
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId');

    const numericAppointmentId = Number(this.appointmentId);

    this.appointment = this.appointments.find(
      appointment => appointment.id === numericAppointmentId
    );
  }

  goBack() {
    this.router.navigate(['/doctor']);
  }

  acceptAppointment() {
    if (this.appointment === undefined) {
      return;
    }

    /*
      TEMPORARY FRONTEND-ONLY LOGIC.

      Later this should call the backend, for example:
      PATCH /api/appointments/{appointmentId}/accept

      The backend should verify:
      - the logged-in user is a doctor
      - this appointment belongs to that doctor
      - the appointment is currently pending
    */
    this.appointment.status = 'booked';
  }

  rejectAppointment() {
    if (this.appointment === undefined) {
      return;
    }

    /*
      TEMPORARY FRONTEND-ONLY LOGIC.

      Later this should call the backend, for example:
      PATCH /api/appointments/{appointmentId}/reject

      The backend should verify:
      - the logged-in user is a doctor
      - this appointment belongs to that doctor
      - the appointment is currently pending
    */
    this.appointment.status = 'rejected';
  }
}