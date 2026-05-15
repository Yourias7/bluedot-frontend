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
 /*  {
    path:'register',
    component: RegisterPage
  }, */
  {
    path: 'search-results',
    component: DoctorResultPage
  },
  {
    path: 'map-results',
    component: DoctorResultPage
  },
  {
    path: 'doctor-details/:id',
    component: DoctorDetailsPage
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
