import { Component, OnInit} from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ListboxModule } from 'primeng/listbox';

import { RegisterCommonFields } from './components/register-common-fields/register-common-fields';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { AuthenticationServices } from '../../../shared/services/authentication-services';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TabsModule, FormsModule, ListboxModule, RegisterCommonFields, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
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
    //this.items = this.doctorSearchService.getSpecialties();

    this.patient_registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z]).*$')]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.pattern('^[0-9]{10}$')]),
      birthDate: new FormControl(''),
      gender: new FormControl(''),
      terms: new FormControl(false, Validators.requiredTrue),
    });

    this.doctor_registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z]).*$')]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      birthDate: new FormControl(''),
      gender: new FormControl('', [Validators.required]),
      clinicAddress: new FormControl('', [Validators.required]),
      specialization: new FormControl([], [Validators.required]),
      terms: new FormControl(false, Validators.requiredTrue),
      bio: new FormControl('')
    });
  }

  ngOnInit() {
    this.doctorSearchService.getSpecialties().subscribe((data) => {
      console.log(data)
      this.items=data;
    })
  }

  submitPatient() {
    this.errorMessage = '';
    this.successMessage = '';

    this.patient_registerForm.markAllAsTouched();

    if (this.patient_registerForm.invalid) {
      this.errorMessage = 'Συμπληρώστε σωστά όλα τα υποχρεωτικά πεδία.';
      return;
    }

    const formData = this.patient_registerForm.value;

    if (formData.pass !== formData.confirmPass) {
      this.errorMessage = 'Οι κωδικοί πρόσβασης δεν ταιριάζουν.';
      return;
    }

    this.isLoading = true;

    this.authenticationServices.registerPatient({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.pass
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Η εγγραφή ολοκληρώθηκε επιτυχώς. Μπορείτε πλέον να συνδεθείτε.';

        setTimeout(() => {
          this.router.navigate(['/landing-page']);
        }, 1200);
      },
      error: error => {
        console.error('Patient registration failed:', error);

        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Η εγγραφή ασθενή απέτυχε. Ελέγξτε τα στοιχεία και δοκιμάστε ξανά.'
        );
      }
    });
  }

  submitDoctor() {
    this.errorMessage = '';
    this.successMessage = '';

    this.doctor_registerForm.markAllAsTouched();

    console.log('Doctor form value:', this.doctor_registerForm.value);
    console.log('Doctor form valid:', this.doctor_registerForm.valid);
    console.log('Doctor form errors:', this.getFormErrors(this.doctor_registerForm));

    if (this.doctor_registerForm.invalid) {
      this.errorMessage = 'Συμπληρώστε σωστά όλα τα υποχρεωτικά πεδία.';
      return;
    }

    const formData = this.doctor_registerForm.value;

    if (formData.pass !== formData.confirmPass) {
      this.errorMessage = 'Οι κωδικοί πρόσβασης δεν ταιριάζουν.';
      return;
    }

    const selectedSpecialties = Array.isArray(formData.specialization)
      ? formData.specialization as Specialty[]
      : [formData.specialization as Specialty];

    const specialtyIds = selectedSpecialties
      .filter(specialty => specialty !== null && specialty !== undefined)
      .map(specialty => specialty.id);

    if (specialtyIds.length === 0) {
      this.errorMessage = 'Επιλέξτε τουλάχιστον μία ειδικότητα.';
      return;
    }

    const doctorPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.pass,
      gender: this.mapGender(formData.gender),
      phoneNumber: formData.phone,
      clinicAddress: formData.clinicAddress,
      specialtyIds: specialtyIds
    };

    console.log('Doctor register payload:', doctorPayload);

    this.isLoading = true;

    this.authenticationServices.registerDoctor(doctorPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Η εγγραφή γιατρού ολοκληρώθηκε επιτυχώς. Μπορείτε πλέον να συνδεθείτε.';

        setTimeout(() => {
          this.router.navigate(['/landing-page']);
        }, 1200);
      },
      error: error => {
        console.error('Doctor registration failed:', error);

        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Η εγγραφή γιατρού απέτυχε. Ελέγξτε τα στοιχεία και δοκιμάστε ξανά.'
        );
      }
    });
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