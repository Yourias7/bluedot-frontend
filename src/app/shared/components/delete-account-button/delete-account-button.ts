import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

import { AuthenticationServices } from '../../services/authentication-services';

@Component({
  selector: 'app-delete-account-button',
  imports: [DialogModule],
  templateUrl: './delete-account-button.html',
  styleUrl: './delete-account-button.scss',
})
export class DeleteAccountButton {
  visible = false;
  isDeleting = false;
  errorMessage = '';

  constructor(
    private authService: AuthenticationServices,
    private router: Router
  ) {}

  openDialog() {
    this.errorMessage = '';
    this.visible = true;
  }

  closeDialog() {
    if (this.isDeleting) {
      return;
    }

    this.visible = false;
    this.errorMessage = '';
  }

  deleteAccount() {
    if (this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.authService.deleteMe().subscribe({
      next: () => {
        this.isDeleting = false;
        this.visible = false;
        localStorage.clear();
        this.router.navigate(['/landing-page']);
      },
      error: error => {
        console.error('Account deletion failed:', error);
        this.isDeleting = false;
        this.errorMessage = 'Δεν ήταν δυνατή η διαγραφή του λογαριασμού. Δοκιμάστε ξανά.';
      }
    });
  }
}
