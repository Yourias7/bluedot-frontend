import { Component, Input, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationServices } from '../../../shared/services/authentication-services';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DialogModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  @Input() isOpen: boolean = false;
  loginForm!: FormGroup;

  constructor(private authService: AuthenticationServices, private router:Router) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log('Login successful', res);
          this.isOpen = false; // Close the dialog
          // TODO: Use Angular Router to redirect to dashboard
          this.router.navigate(['/landing-page']);
        },
        error: (err) => {
          console.error('Login failed', err);
          // TODO: Show an error message to the user
        }
      });
    }
  }

  goToRegister(){
    this.router.navigate(['/register']);
  }
}