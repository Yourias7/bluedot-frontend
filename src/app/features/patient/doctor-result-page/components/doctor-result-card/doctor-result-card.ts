import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  readonly starPositions = [1, 2, 3, 4, 5];

  get rating(): number {
    return this.doctor?.averageRating ?? 0;
  }

  get reviewCount(): number {
    return this.doctor?.reviewCount ?? 0;
  }

  getFilledStars(): number {
    return Math.min(Math.max(Math.round(this.rating), 0), 5);
  }

  viewDetails(id?: number) {
    this.cardClicked.emit(id);
  }
}
