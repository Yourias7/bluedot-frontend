import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-return-button',
  imports: [RouterLink],
  templateUrl: './return-button.html',
  styleUrl: './return-button.scss',
})
export class ReturnButton {
  constructor(private router: Router) {}

  navigateToLandingPage(): void {
    this.router.navigate(['/landing-page']);
  }
}
