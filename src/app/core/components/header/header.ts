import { Component } from '@angular/core';
import { Logo } from "../logo/logo";
import { RouterLink } from "@angular/router";
import { RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [Logo, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
   navRoutes = [
    { path: 'landing-page', title: 'Αρχική' },
    { path: 'search-results', title: 'Κλείσε ραντεβού' },
   
  ];
}
