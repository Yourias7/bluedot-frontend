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
  @Output() messageEvent = new EventEmitter<number>();

  sendMessage(){
    console.log(this.appointment.id);
    this.messageEvent.emit(this.appointment.id);
  }
}
