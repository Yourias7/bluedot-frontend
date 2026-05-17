import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { ListboxModule } from 'primeng/listbox';

import { RegisterCommonFields } from './components/register-common-fields/register-common-fields';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { AuthenticationServices } from '../../../shared/services/authentication-services';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pass = control.get('pass')?.value;
  const confirmPass = control.get('confirmPass')?.value;
  return pass && confirmPass && pass !== confirmPass ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, TabsModule, FormsModule, ListboxModule, RegisterCommonFields],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  items: Specialty[] = [];
  patient_registerForm: FormGroup;
  doctor_registerForm: FormGroup;

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private doctorSearchService: DoctorSearchService,
    private authenticationServices: AuthenticationServices,
    private router: Router
  ) {
    this.items = this.doctorSearchService.getSpecialties();

    this.patient_registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.pattern('^[0-9]{10}$')]),
      birthDate: new FormControl(''),
      gender: new FormControl(''),
      terms: new FormControl(false, Validators.requiredTrue),
    }, { validators: passwordsMatchValidator });

    this.doctor_registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      birthDate: new FormControl(''),
      gender: new FormControl('', [Validators.required]),
      clinicAddress: new FormControl('', [Validators.required]),
      specialization: new FormControl([], [Validators.required]),
      terms: new FormControl(false, Validators.requiredTrue),
      bio: new FormControl('', [Validators.required, Validators.maxLength(1000)])
    }, { validators: passwordsMatchValidator });
  }

  private mapGender(gender: string): string {
    if (gender === 'male') {
      return 'Male';
    }

    if (gender === 'female') {
      return 'Female';
    }

    return 'Other';
  }

  private getErrorMessage(error: any, fallbackMessage: string): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (this.doctor_registerForm.valid) {
      const formData = this.doctor_registerForm.value;
      console.log('Doctor Data:', formData);
      console.log('Selected specializations:', formData.specialization);

    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (error?.error?.title) {
      return error.error.title;
    }

    return fallbackMessage;
  }

  private getFormErrors(form: FormGroup): Record<string, unknown> {
    const errors: Record<string, unknown> = {};

    Object.keys(form.controls).forEach(controlName => {
      const control = form.get(controlName);

      if (control?.errors) {
        errors[controlName] = control.errors;
      }
    });

    return errors;
  }
}