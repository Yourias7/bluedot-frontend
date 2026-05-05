import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { DoctorResultCard } from "./components/doctor-result-card/doctor-result-card";

@Component({
  selector: 'app-doctor-result-page',
  imports: [AvatarModule, DoctorResultCard],
  templateUrl: './doctor-result-page.html',
  styleUrl: './doctor-result-page.scss',
})
export class DoctorResultPage {}
