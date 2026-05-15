import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { Paginator, PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Doctor } from '../../../shared/domain/doctor';
import { DoctorResultCard } from "./components/doctor-result-card/doctor-result-card";
import { DoctorService } from '../../../shared/services/doctor-service';
import { Router } from '@angular/router';
import { PaginatorBasicDemo } from '../../../shared/components/paginator-basic/paginator-basic';
import { Tag, TagModule } from 'primeng/tag';

@Component({
  selector: 'app-doctor-result-page',
  imports: [CommonModule, AvatarModule, PaginatorModule, DoctorResultCard, PaginatorBasicDemo, Tag, TagModule],
  templateUrl: './doctor-result-page.html',
  styleUrl: './doctor-result-page.scss',
})
export class DoctorResultPage {

  doctors?: Doctor[];
  first = 0;
  rows = 5;

  constructor(doctorService: DoctorService, private router: Router) {
    this.doctors = doctorService.getDoctors();
  }

  get pagedDoctors(): Doctor[] {
    return this.doctors?.slice(this.first, this.first + this.rows) ?? [];
  }

  onPage(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  onCardClicked(id?: number) {
    console.log("lmaoooo");
    this.router.navigate(['/doctor-details', id]);
  }
}
