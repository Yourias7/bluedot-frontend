import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Doctor } from '../../../../../shared/domain/doctor';

@Component({
  selector: 'app-doctor-result-card',
  imports: [AvatarModule],
  templateUrl: './doctor-result-card.html',
  styleUrl: './doctor-result-card.scss',
})
export class DoctorResultCard {
  @Input() doctor?: Doctor;
  @Output() cardClicked = new EventEmitter<number>();

  viewDetails(id?: number) {
    {
      console.log("clicked card with id: " + id);
      this.cardClicked.emit(id);
    }
  }
}
