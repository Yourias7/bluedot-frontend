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
export class Login {
  @Input() isOpen = false;

  @Output() loginSucceeded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

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
    this.modalClosed.emit();
  }

  submitLogin() {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;

    if (email === null || password === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authenticationServices.login({
      email,
      password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginSucceeded.emit();
        this.closeModal();

        const role = this.authenticationServices.getCurrentUserRole();

        if (role === 'doctor') {
          this.router.navigate(['/doctor']);
          return;
        }

        if (role === 'patient') {
          this.router.navigate(['/landing-page']);
          return;
        }

        if (role === 'manager') {
          this.router.navigate(['/landing-page']);
          return;
        }

        this.router.navigate(['/landing-page']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Λάθος email ή κωδικός πρόσβασης.';
      }
    });
  }
}
