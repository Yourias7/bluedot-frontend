import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarDay } from '../../../../shared/domain/calendar-day';
import { DoctorService } from '../../../../shared/services/doctor-service';

@Component({
  selector: 'app-doctor-home',
  imports: [],
  templateUrl: './doctor-home.html',
  styleUrl: './doctor-home.scss'
})
export class DoctorHome {
  weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
calendarDays: CalendarDay[] = [];

  constructor(private router: Router, private doctorService: DoctorService) {
    this.doctorService.getDaysWithAvailability().subscribe(days => {
      this.calendarDays = days;
    });
   }  

  openDay(day: CalendarDay) {
  this.router.navigate(['/doctor/availability'], {
    queryParams: { day: day.date }
  });
}
}