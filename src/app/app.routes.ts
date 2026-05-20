import { Routes } from '@angular/router';

import { LandingPage } from './features/visitor/landing-page/landing-page';
import { DoctorResultPage } from './features/patient/doctor-result-page/doctor-result-page';
import { DoctorHome } from './features/doctor/pages/doctor-home/doctor-home';
import { DoctorAvailability } from './features/doctor/pages/doctor-availability/doctor-availability';
import { DoctorAppointmentDetails } from './features/doctor/pages/doctor-appointment-details/doctor-appointment-details';
import { DoctorAppointments } from './features/doctor/pages/doctor-appointments/doctor-appointments';
import { DoctorAccountDetails } from './features/doctor/pages/doctor-account-details/doctor-account-details';
import { DoctorDetailsPage } from './features/patient/doctor-details-page/doctor-details-page';
import { Register } from './features/visitor/register/register';
import { MapLayout } from './features/visitor/map-layout/map-layout';
import { BookAppointment } from './features/patient/book-appointment/book-appointment';
import { AppointmentConfirm } from './features/patient/appointment-confirm/appointment-confirm';
import { AccountDetails } from './features/patient/account-details/account-details';
import { PatientAppointments } from './features/patient/patient-appointments/patient-appointments';
import { Help } from './features/visitor/help/help';
import { About } from './features/visitor/about/about';
import { AppointmentConfirmEnd } from './features/patient/appointment-confirm-end/appointment-confirm-end';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';

import { roleRedirectGuard } from './shared/guards/role-redirect.guard';
import { guestOnlyGuard } from './shared/guards/guest-only.guard';
import { patientOnlyGuard } from './shared/guards/patient-only.guard';
import { doctorOnlyGuard } from './shared/guards/doctor-only.guard';
import { managerOnlyGuard } from './shared/guards/manager-only.guard';

import { Error404 } from './shared/components/error-404/error-404';
import { Error403 } from './shared/components/error-403/error-403';
import { Error500 } from './shared/components/error-500/error-500';
// App's landing page
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing-page',
    pathMatch: 'full'
  },

  // Public / visitor routes
  {
    path: 'landing-page',
    component: LandingPage,
    canActivate: [roleRedirectGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestOnlyGuard]
  },
  {
    path: 'search-results',
    component: DoctorResultPage
  },
  {
    path: 'map-results',
    component: MapLayout
  },
  {
    path: 'doctor-details/:id',
    component: DoctorDetailsPage
  },
  {
    path: 'help',
    component: Help
  },
  {
    path: 'about',
    component: About
  },

  // Patient-only routes
  {
    path: 'book-appointment/:id',
    component: BookAppointment,
    canActivate: [patientOnlyGuard]
  },
  {
    path: 'appointment-confirmation',
    component: AppointmentConfirm,
    canActivate: [patientOnlyGuard]
  },
  {
    path: 'appointment-confirm-end',
    component: AppointmentConfirmEnd,
    canActivate: [patientOnlyGuard]
  },
  {
    path: 'patient-account-details',
    component: AccountDetails,
    canActivate: [patientOnlyGuard]
  },
  {
    path: 'patient-appointments',
    component: PatientAppointments,
    canActivate: [patientOnlyGuard]
  },
  // Admin / manager-only routes
  {
    path: 'manager',
    component: AdminDashboard,
    canActivate: [managerOnlyGuard]
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboard,
    canActivate: [managerOnlyGuard]
  },

  // Doctor-only routes
  {
    path: 'doctor',
    component: DoctorHome,
    canActivate: [doctorOnlyGuard]
  },
  {
    path: 'doctor/availability',
    component: DoctorAvailability,
    canActivate: [doctorOnlyGuard]
  },
  {
    path: 'doctor/appointments',
    component: DoctorAppointments,
    canActivate: [doctorOnlyGuard]
  },
  {
    path: 'doctor/appointments/:appointmentId',
    component: DoctorAppointmentDetails,
    canActivate: [doctorOnlyGuard]
  },
  {
    path: 'doctor/account-details',
    component: DoctorAccountDetails,
    canActivate: [doctorOnlyGuard]
  },

  // Error routes
  {
    path: '403',
    component: Error403
  },
  {
    path: '500',
    component: Error500
  },
  {
    path: '404',
    component: Error404
  },
  {
    path: '**',
    redirectTo: '404'
  }
];