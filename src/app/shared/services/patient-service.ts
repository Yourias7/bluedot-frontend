import { Injectable } from '@angular/core';
import { Appointment } from '../domain/appointment';
import { Patient } from '../domain/patient';
import { UserRole } from '../domain/user';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private _patient: Patient | null = {
    id: 1,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    password: 'password123',
    role: UserRole.Patient,
    dateOfBirth: new Date('1990-05-15'),
    phoneNumber: '+1234567890',
  };

  private _appointments: Appointment[] = [
    {
      id: 201,
      status: 'pending',
      specialty: 'General Practitioner',
      date: '2026-06-01',
      startTime: '09:00',
      endTime: '09:30',
      patientName: 'Jane Doe',
      patientPhone: '+1234567890',
      patientEmail: 'jane.doe@example.com',
      patientMessage: 'I would like a general checkup appointment.',
      conversation: []
    },
    {
      id: 202,
      status: 'booked',
      specialty: 'Dentist',
      date: '2026-06-10',
      startTime: '11:00',
      endTime: '11:30',
      patientName: 'Jane Doe',
      patientPhone: '+1234567890',
      patientEmail: 'jane.doe@example.com',
      patientMessage: 'Teeth cleaning appointment.',
      conversation: []
    },
    {
      id: 203,
      status: 'rejected',
      specialty: 'Dermatologist',
      date: '2026-06-15',
      startTime: '14:00',
      endTime: '14:30',
      patientName: 'Jane Doe',
      patientPhone: '+1234567890',
      patientEmail: 'jane.doe@example.com',
      patientMessage: 'Skin rash consultation.',
      conversation: []
    }
  ];

  getPatient(): Patient | null {
    return this._patient;
  }

  getAppointments(): Appointment[] {
    return this._appointments;
  }
}
