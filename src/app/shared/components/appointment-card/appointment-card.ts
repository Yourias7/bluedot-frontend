// Reusable card that displays a single appointment and emits its ID when selected
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Appointment } from '../../domain/appointment';

@Component({
  selector: 'app-appointment-card',
  imports: [],
  templateUrl: './appointment-card.html',
  styleUrl: './appointment-card.scss',
})
export class AppointmentCard {
  @Input() appointment!: Appointment;
  @Output() messageEvent = new EventEmitter<number>(); // emits appointment.id to the parent

  sendMessage(){
    this.messageEvent.emit(this.appointment.id);
  }
}
