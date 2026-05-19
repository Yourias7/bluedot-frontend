import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
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
    Login,
    Avatar,
    MenuModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  currentUserRole: UserRole = 'guest';
  currentUserName = '';

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
    { path: '/doctor', title: 'Αρχική' },
    { path: '/doctor/availability', title: 'Διαθεσιμότητα' },
    { path: '/doctor/appointments', title: 'Ραντεβού' },
    { path: '/about', title: 'Σχετικά' },
    { path: '/help', title: 'Βοήθεια' }
  ];

  managerNavRoutes: NavRoute[] = [
    { path: '/manager', title: 'Dashboard' }
  ];

  loggedInOptions: MenuItem[];
  doctorOptions: MenuItem[];
  managerOptions: MenuItem[];

  constructor(
    private authenticationServices: AuthenticationServices,
    private router: Router
  ) {
    this.loggedInOptions = [
      {
        label: 'Ο λογαριασμός μου',
        command: () => {
          this.router.navigate(['/patient-account-details']);
        }
      },
      {
        label: 'Τα ραντεβού μου',
        command: () => {
          this.router.navigate(['/patient-appointments']);
        }
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
        command: () => {
          this.router.navigate(['/doctor/account-details']);
        }
      },
      {
        label: 'Ραντεβού',
        command: () => {
          this.router.navigate(['/doctor/appointments']);
        }
      },
      { separator: true },
      {
        label: 'Αποσύνδεση',
        command: () => this.onLogout()
      }
    ];

    this.managerOptions = [
      {
        label: 'Dashboard',
        command: () => {
          this.router.navigate(['/manager']);
        }
      },
      { separator: true },
      {
        label: 'Αποσύνδεση',
        command: () => this.onLogout()
      }
    ];
  }

  ngOnInit(): void {
    this.authSubscription.add(
      this.authenticationServices.currentUserRole$.subscribe(role => {
        this.currentUserRole = role;
      })
    );

    this.authSubscription.add(
      this.authenticationServices.currentUserName$.subscribe(name => {
        this.currentUserName = name;
      })
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  get navRoutes(): NavRoute[] {
    if (this.currentUserRole === 'doctor') {
      return this.doctorNavRoutes;
    }

    if (this.currentUserRole === 'manager') {
      return this.managerNavRoutes;
    }

    return this.patientNavRoutes;
  }

  get displayUserName(): string {
    if (!this.currentUserName) {
      if (this.currentUserRole === 'manager') {
        return 'Admin';
      }

      if (this.currentUserRole === 'doctor') {
        return 'Γιατρός';
      }

      if (this.currentUserRole === 'patient') {
        return 'Ασθενής';
      }

      return '';
    }

    if (this.currentUserName.includes('@')) {
      return this.currentUserName
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .trim();
    }

    return this.currentUserName;
  }

  onLogout(): void {
    this.authenticationServices.logout();
  }

  register() {
    this.router.navigate(['/register']);
  }

  onNavClick(event: MouseEvent, path: string): void {
    const isActive = this.router.isActive(path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });

    if (!isActive) {
      return;
    }

    event.preventDefault();
    void this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      void this.router.navigateByUrl(path);
    });
  }
}