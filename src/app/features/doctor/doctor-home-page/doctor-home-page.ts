import { Component } from '@angular/core';
import { Router } from '@angular/router';

type CalendarDay = {
  number: number;
  date: string;
  hasActivity: boolean;
};

@Component({
  selector: 'app-doctor-home-page',
  imports: [],
  templateUrl: './doctor-home-page.html',
  styleUrl: './doctor-home-page.scss'
})
export class DoctorHomePage {
  weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  calendarDays: CalendarDay[] = [
    { number: 1, date: '2025-09-01', hasActivity: false },
    { number: 2, date: '2025-09-02', hasActivity: false },
    { number: 3, date: '2025-09-03', hasActivity: false },
    { number: 4, date: '2025-09-04', hasActivity: false },
    { number: 5, date: '2025-09-05', hasActivity: false },
    { number: 6, date: '2025-09-06', hasActivity: false },
    { number: 7, date: '2025-09-07', hasActivity: false },
    { number: 8, date: '2025-09-08', hasActivity: false },
    { number: 9, date: '2025-09-09', hasActivity: true },
    { number: 10, date: '2025-09-10', hasActivity: false },
    { number: 11, date: '2025-09-11', hasActivity: false },
    { number: 12, date: '2025-09-12', hasActivity: false },
    { number: 13, date: '2025-09-13', hasActivity: true },
    { number: 14, date: '2025-09-14', hasActivity: false },
    { number: 15, date: '2025-09-15', hasActivity: false },
    { number: 16, date: '2025-09-16', hasActivity: false },
    { number: 17, date: '2025-09-17', hasActivity: false },
    { number: 18, date: '2025-09-18', hasActivity: false },
    { number: 19, date: '2025-09-19', hasActivity: false },
    { number: 20, date: '2025-09-20', hasActivity: false },
    { number: 21, date: '2025-09-21', hasActivity: false },
    { number: 22, date: '2025-09-22', hasActivity: false },
    { number: 23, date: '2025-09-23', hasActivity: false },
    { number: 24, date: '2025-09-24', hasActivity: false },
    { number: 25, date: '2025-09-25', hasActivity: false },
    { number: 26, date: '2025-09-26', hasActivity: false },
    { number: 27, date: '2025-09-27', hasActivity: false },
    { number: 28, date: '2025-09-28', hasActivity: false },
    { number: 29, date: '2025-09-29', hasActivity: false },
    { number: 30, date: '2025-09-30', hasActivity: false }
  ];

  constructor(private router: Router) {}

  openDay(day: CalendarDay) {
    this.router.navigate(['/doctor/availability', day.date]);
  }
}