import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserRole } from '../../../../shared/domain/user-role';
import { AuthenticationServices } from '../../../../shared/services/authentication-services';
import { Logo } from '../common/logo/logo';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Login } from '../../../../features/visitor/login/login';

type NavRoute = {
  path: string;
  title: string;
};

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo, DialogModule, Button, Login],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  currentUserRole: UserRole;
  currentUserName: string;

  isLoginModalOpen = false;

  patientNavRoutes: NavRoute[] = [
  { path: 'landing-page', title: 'Αρχική' },
  { path: 'map-results', title: 'Ιατροί κοντά μου'},
  { path: 'search-results', title: 'Συνεργαζόμενοι ιατροί'},
  { path: 'landing-page', title: 'Σχετικά' },
  { path: 'landing-page', title: 'Βοήθεια' }
];

  doctorNavRoutes: NavRoute[] = [
    { path: 'doctor', title: 'Αρχική σελίδα' },
    { path: 'doctor', title: 'Διαθεσιμότητα' },
    { path: 'doctor/availability/2025-09-09', title: 'Ραντεβού ημέρας' }
  ];

  constructor(private authenticationServices: AuthenticationServices, private router: Router) {
    this.currentUserRole = this.authenticationServices.getCurrentUserRole();
    this.currentUserName = this.authenticationServices.getCurrentUserName();
  }

  get navRoutes(): NavRoute[] {
    if (this.currentUserRole === 'doctor') {
      return this.doctorNavRoutes;
    }

    return this.patientNavRoutes;
  }

  register() {
    this.router.navigate(['/register']);
  }
}