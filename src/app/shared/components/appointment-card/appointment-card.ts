import { Component, Input } from '@angular/core';
import { Appointment } from '../../domain/appointment';

@Component({
  selector: 'app-appointment-card',
  imports: [],
  templateUrl: './appointment-card.html',
  styleUrl: './appointment-card.scss',
})
export class AppointmentCard {
  @Input() appointment!: Appointment;
}
