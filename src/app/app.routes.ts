import { Routes } from '@angular/router';
import { LandingPage } from './features/visitor/landing-page/landing-page';
import { DoctorResultPage } from './features/patient/doctor-result-page/doctor-result-page';
import { DoctorHome } from './features/doctor/pages/doctor-home/doctor-home';
import { DoctorAvailability,} from './features/doctor/pages/doctor-availability/doctor-availability';
import { DoctorAppointmentDetails, } from './features/doctor/pages/doctor-appointment-details/doctor-appointment-details';
import { roleRedirectGuard } from './shared/guards/role-redirect.guard';
import { doctorOnlyGuard } from './shared/guards/doctor-only.guard';
import { Error404 } from './shared/components/error-404/error-404';
import { DoctorDetailsPage } from './features/patient/doctor-details-page/doctor-details-page';
import { Register } from './features/visitor/register/register';
import { MapLayout } from './features/visitor/map-layout/map-layout';
import { BookAppointment } from './features/patient/book-appointment/book-appointment';
import { AppointmentConfirm } from './features/patient/appointment-confirm/appointment-confirm';

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
    path:'register',
    component: Register
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
    path: 'book-appointment/:id',
    component: BookAppointment
  },
  {
    path: 'appointment-confirmation',
    component: AppointmentConfirm
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
    path: 'doctor/appointments/:appointmentId',
    component: DoctorAppointmentDetails,
    canActivate: [doctorOnlyGuard]
  },
  {
    path: '404',
    component: Error404
  }
];
