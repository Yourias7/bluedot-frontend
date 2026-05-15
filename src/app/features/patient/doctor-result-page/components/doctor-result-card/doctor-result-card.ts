import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { Doctor } from '../../../../../shared/domain/doctor';

@Component({
  selector: 'app-doctor-result-card',
  imports: [CommonModule, AvatarModule],
  templateUrl: './doctor-result-card.html',
  styleUrl: './doctor-result-card.scss',
})
export class DoctorResultCard {
  @Input() doctor?: Doctor;
  @Output() cardClicked = new EventEmitter<number>();

  review:number = 2;
  getfilledStars(): number {
    return Math.min(Math.max(Math.round(this.review), 1), 5);
  }
  viewDetails(id?: number) {
    {
      console.log("clicked card with id: " + id);
      this.cardClicked.emit(id);
    }
  }
}
