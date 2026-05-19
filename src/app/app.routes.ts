import { Routes } from '@angular/router';
import { LandingPage } from './features/visitor/landing-page/landing-page';
import { DoctorResultPage } from './features/patient/doctor-result-page/doctor-result-page';
import { DoctorHome } from './features/doctor/pages/doctor-home/doctor-home';
import { DoctorAvailability, } from './features/doctor/pages/doctor-availability/doctor-availability';
import { DoctorAppointmentDetails, } from './features/doctor/pages/doctor-appointment-details/doctor-appointment-details';
import { DoctorAppointments } from './features/doctor/pages/doctor-appointments/doctor-appointments';
import { DoctorAccountDetails } from './features/doctor/pages/doctor-account-details/doctor-account-details';
import { roleRedirectGuard } from './shared/guards/role-redirect.guard';
import { doctorOnlyGuard } from './shared/guards/doctor-only.guard';
import { Error404 } from './shared/components/error-404/error-404';
import { DoctorDetailsPage } from './features/patient/doctor-details-page/doctor-details-page';
import { Register } from './features/visitor/register/register';
import { MapLayout } from './features/visitor/map-layout/map-layout';
import { BookAppointment } from './features/patient/book-appointment/book-appointment';
import { AppointmentConfirm } from './features/patient/appointment-confirm/appointment-confirm';
import { AccountDetails } from "./features/patient/account-details/account-details";
import { PatientAppointments } from './features/patient/patient-appointments/patient-appointments';
import { Error403 } from './shared/components/error-403/error-403';
import { Error500 } from './shared/components/error-500/error-500';
import { AppointmentDetails } from './shared/components/appointment-details/appointment-details';
import { Help } from './features/visitor/help/help';
import { About } from './features/visitor/about/about';
import { AppointmentConfirmEnd } from './features/patient/appointment-confirm-end/appointment-confirm-end';
import { PrivacyPolicy } from './core/app-layout/components/common/privacy-policy/privacy-policy';
import { Cookies } from './core/app-layout/components/common/cookies/cookies';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing-page',
    pathMatch: 'full'
  },
  {
    path: 'landing-page',
    component: LandingPage,
    canActivate: [roleRedirectGuard]
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'search-results',
    component: DoctorResultPage,
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
    path: 'book-appointment/:id',
    component: BookAppointment
  },
  {
    path: 'appointment-confirmation',
    component: AppointmentConfirm
  },
  {
    path: 'appointment-confirm-end',
    component: AppointmentConfirmEnd
  },
  {
    path: 'patient-account-details',
    component: AccountDetails
  },
  {
    path: 'patient-appointments',
    component: PatientAppointments
  },
  {
    path: 'patient-appointments/:id',
    component: AppointmentDetails
  },
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
  {
    path: 'help',
    component: Help
  },
  {
    path: 'about',
    component: About
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicy
  },
  {
    path: '404',
    component: Error404
  },
  {
    path: '**',
    redirectTo: '404'
  },
  {
    path: '403',
    component: Error403
  },
  {
    path: '500',
    component: Error500
  }
];
