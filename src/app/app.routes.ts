import { Routes } from '@angular/router';
import { LandingPage } from './features/landing-page/landing-page';
import { DoctorResultPage } from './features/patient/doctor-result-page/doctor-result-page';

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
        path:'map-results',
        component:DoctorResultPage
    }
];
