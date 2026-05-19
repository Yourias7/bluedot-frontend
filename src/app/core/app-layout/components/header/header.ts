import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs'; // <-- Add Subscription
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
export class Header implements OnInit, OnDestroy {
  currentUserRole: UserRole = 'guest';
  currentUserName: string = '';

  isLoginModalOpen = false;

  private authSubscription: Subscription = new Subscription();

  patientNavRoutes: NavRoute[] = [
    { path: '/landing-page', title: 'Αρχική' },
    { path: '/map-results', title: 'Ιατροί κοντά μου' },
    { path: '/search-results', title: 'Συνεργαζόμενοι ιατροί' },
    { path: '/about', title: 'Σχετικά' },
    { path: '/help', title: 'Βοήθεια' }
  ];

  doctorNavRoutes: NavRoute[] = [
    { path: '/doctor', title: 'Αρχική σελίδα' },
    { path: '/doctor/availability', title: 'Διαθεσιμότητα' },
    { path: '/doctor/appointments', title: 'Τα ραντεβού μου' }
  ];

  loggedInOptions: MenuItem[];
  doctorOptions: MenuItem[];

  constructor(
    private authenticationServices: AuthenticationServices,
    private router: Router
  ) {

    this.loggedInOptions = [
      {
        label: 'Ο λογαριασμός μου',
        command: () => { this.router.navigate(['/patient-account-details']); }
      },
      {
        label: 'Τα ραντεβού μου',
        command: () => { this.router.navigate(['/patient-appointments']); }
      },
      { separator: true },
      {
        label: 'Αποσύνδεση',
        command: () => this.onLogout()
      }
    ];

    this.doctorOptions = [
      {
        label: 'Ο λογαριασμός μου',
        command: () => { this.router.navigate(['/doctor/account-details']); }
      },
      {
        label: 'Αρχική σελίδα',
        command: () => { this.router.navigate(['/doctor']); }
      },
      {
        label: 'Διαθεσιμότητα',
        command: () => { this.router.navigate(['/doctor/availability']); }
      },
      {
        label: 'Τα ραντεβού μου',
        command: () => { this.router.navigate(['/doctor/appointments']); }
      },
      { separator: true },
      {
        label: 'Αποσύνδεση',
        command: () => this.onLogout()
      }
    ];
  }

  ngOnInit(): void {
    // Listen to changes in the role
    this.authSubscription.add(
      this.authenticationServices.currentUserRole$.subscribe(role => {
        this.currentUserRole = role;
      })
    );

    // Listen to changes in the name
    this.authSubscription.add(
      this.authenticationServices.currentUserName$.subscribe(name => {
        this.currentUserName = name;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up to prevent memory leaks
    this.authSubscription.unsubscribe();
  }

  onLogout(): void {
    this.authenticationServices.logout();
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