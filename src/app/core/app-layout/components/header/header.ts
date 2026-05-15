import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserRole } from '../../../../shared/domain/user-role';
import { AuthenticationServices } from '../../../../shared/services/authentication-services';
import { Logo } from '../common/logo/logo';

type NavRoute = {
  path: string;
  title: string;
};

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  currentUserRole: UserRole;
  currentUserName: string;

  patientNavRoutes: NavRoute[] = [
  { path: 'landing-page', title: 'Αρχική' },
  { path: 'search-results', title: 'Ιατροί κοντά μου' },
  { path: 'search-results', title: 'Συνεργαζόμενοι ιατροί' },
  { path: 'landing-page', title: 'Σχετικά' },
  { path: 'landing-page', title: 'Βοήθεια' }
];

  doctorNavRoutes: NavRoute[] = [
    { path: 'doctor', title: 'Αρχική σελίδα' },
    { path: 'doctor', title: 'Διαθεσιμότητα' },
    { path: 'doctor/availability/2025-09-09', title: 'Ραντεβού ημέρας' }
  ];

  constructor(private authenticationServices: AuthenticationServices) {
    this.currentUserRole = this.authenticationServices.getCurrentUserRole();
    this.currentUserName = this.authenticationServices.getCurrentUserName();
  }

  get navRoutes(): NavRoute[] {
    if (this.currentUserRole === 'doctor') {
      return this.doctorNavRoutes;
    }

    return this.patientNavRoutes;
  }
}