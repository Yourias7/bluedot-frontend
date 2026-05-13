import { DoctorHomePage } from './features/doctor/doctor-home-page/doctor-home-page';
import { DoctorAvailabilityPage } from './features/doctor/doctor-availability-page/doctor-availability-page';
import { DoctorAppointmentDetailsPage } from './features/doctor/doctor-appointment-details-page/doctor-appointment-details-page';
import { roleRedirectGuard } from './core/guards/role-redirect.guard';
import { doctorOnlyGuard } from './core/guards/doctor-only.guard';

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
    path: 'search-results',
    component: DoctorResultPage
  },
  {
    path: 'map-results',
    component: DoctorResultPage
  },
  {
    path: 'doctor',
    component: DoctorHomePage,
    canActivate: [doctorOnlyGuard]
  },
  {
    path: 'doctor/availability/:date',
    component: DoctorAvailabilityPage,
    canActivate: [doctorOnlyGuard]
  },
  {
    path: 'doctor/appointments/:appointmentId',
    component: DoctorAppointmentDetailsPage,
    canActivate: [doctorOnlyGuard]
  },
     {
        path:'404',
        component:Error404
    }
];
