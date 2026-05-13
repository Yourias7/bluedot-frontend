import { Routes } from '@angular/router';
import { LandingPage } from './features/landing-page/landing-page';
import { DoctorResultPage } from './features/patient/doctor-result-page/doctor-result-page';
import { DoctorDetailsPage } from './features/patient/doctor-details-page/doctor-details-page';
import { Error404 } from './shared/components/error-404/error-404';

export const routes: Routes = [
    {
        path: '',
        redirectTo:"landing-page",
        pathMatch: 'full'
    },
    {
        path:'landing-page',
        component:LandingPage
    },
    {
        path:'search-results',
        component:DoctorResultPage
    },
    {
        path:'doctor-details/:id',
        component:DoctorDetailsPage
    },
    {
        path:'map-results',
        component:DoctorResultPage
    },
    {
        path:'404',
        component:Error404
    }
];
