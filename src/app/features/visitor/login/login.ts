import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { AuthenticationServices } from '../../../shared/services/authentication-services';

@Component({
  selector: 'app-login',
  imports: [DialogModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
// Login modal: authenticates the user and redirects to the appropriate role-based home route
export class Login {
  @Input() isOpen: boolean = false;

  @Output() loginSucceeded = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<boolean>();

  isLoading = false;
  errorMessage = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private authenticationServices: AuthenticationServices,
    private router: Router
  ) {}

  closeModal() {
    this.isOpen = false;
    this.errorMessage = '';
    this.modalClosed.emit(true);
  }

  redirectToRegister() {
    this.closeModal();
    this.router.navigate(['/register']);
  }

  submitLogin() {
    this.loginForm.markAllAsTouched(); // triggers validation UI on all fields before checking validity

    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;

    if (email === null || password === null) {
      return; // type narrowing — FormControl values can be null when reset
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authenticationServices.login({
      email,
      password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginSucceeded.emit(true);
        this.closeModal();

        // role is read after login() so it reflects the freshly stored value
        const role = this.authenticationServices.getCurrentUserRole();

        if (role === 'doctor') {
          this.router.navigate(['/doctor']);
          return;
        }

        if (role === 'manager') {
          this.router.navigate(['/manager']);
          return;
        }

        if (role === 'patient') {
          this.router.navigate(['/landing-page']);
          return;
        }

        this.router.navigate(['/landing-page']); // fallback for unknown roles
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Λάθος email ή κωδικός πρόσβασης.';
      }
    });
  }
}