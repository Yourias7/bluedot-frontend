import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { DialogModule } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

import { UserRole } from '../../../../shared/domain/user-role';
import { AuthenticationServices } from '../../../../shared/services/authentication-services';
import { Logo } from '../common/logo/logo';
import { Login } from '../../../../features/visitor/login/login';

type NavRoute = {
  path: string;
  title: string;
};

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    Logo,
    DialogModule,
    Button,
    Login,
    Avatar,
    MenuModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  currentUserRole: UserRole;
  currentUserName: string;

  isLoginModalOpen = false;

  patientNavRoutes: NavRoute[] = [
    { path: '/landing-page', title: 'Αρχική' },
    { path: '/map-results', title: 'Ιατροί κοντά μου' },
    { path: '/search-results', title: 'Συνεργαζόμενοι ιατροί' },
    { path: '/landing-page', title: 'Σχετικά' },
    { path: '/landing-page', title: 'Βοήθεια' }
  ];

  doctorNavRoutes: NavRoute[] = [
    { path: '/doctor', title: 'Αρχική σελίδα' },
    { path: '/doctor/availability', title: 'Διαθεσιμότητα' },
    { path: '/doctor/appointments', title: 'Τα ραντεβού μου' }
  ];

  loggedInOptions: MenuItem[];
  doctorOptions: MenuItem[];

  refreshCurrentUser() {
    this.currentUserRole = this.authenticationServices.getCurrentUserRole();
    this.currentUserName = this.authenticationServices.getCurrentUserName();
  }

  constructor(
    private authenticationServices: AuthenticationServices,
    private router: Router
  ) {
    this.currentUserRole = this.authenticationServices.getCurrentUserRole();
    this.currentUserName = this.authenticationServices.getCurrentUserName();

    this.loggedInOptions = [
      {
        label: 'Ο λογαριασμός μου',
        command: () => {
          this.router.navigate(['/patient-account-details/1']);
        }
      },
      {
        label: 'Τα ραντεβού μου',
        command: () => {
          this.router.navigate(['/patient-appointments/1']);
        }
      },
      { separator: true },
      {
        label: 'Αποσύνδεση',
        routerLink: ['/404']
      }
    ];

    this.doctorOptions = [
      {
        label: 'Ο λογαριασμός μου',
        command: () => {
          this.router.navigate(['/doctor/account-details']);
        }
      },
      {
        label: 'Αρχική σελίδα',
        command: () => {
          this.router.navigate(['/doctor']);
        }
      },
      {
        label: 'Διαθεσιμότητα',
        command: () => {
          this.router.navigate(['/doctor/availability']);
        }
      },
      {
        label: 'Τα ραντεβού μου',
        command: () => {
          this.router.navigate(['/doctor/appointments']);
        }
      },
      { separator: true },
      {
        label: 'Αποσύνδεση',
        routerLink: ['/404']
      }
    ];
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