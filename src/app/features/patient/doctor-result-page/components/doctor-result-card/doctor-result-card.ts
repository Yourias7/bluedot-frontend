import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-doctor-result-card',
  imports: [AvatarModule],
  templateUrl: './doctor-result-card.html',
  styleUrl: './doctor-result-card.scss',
})
export class DoctorResultCard {}
