import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ListboxModule } from 'primeng/listbox';

import { RegisterCommonFields } from './components/register-common-fields/register-common-fields';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { AuthenticationServices } from '../../../shared/services/authentication-services';
import { NominatimService, LocationSuggestion } from '../../../shared/services/nominatim.service';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

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

  // Autocomplete state variables
  addressSuggestions: LocationSuggestion[] = [];
  isSearchingAddress = false;
  showSuggestions = false;

  constructor(
    private doctorSearchService: DoctorSearchService,
    private authenticationServices: AuthenticationServices,
    private router: Router,
    private nominatimService: NominatimService
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
      this.items = data;
    })
    this.setupAddressAutocomplete();
  }

  // Set up reactive listener for the clinic address field
  setupAddressAutocomplete() {
    this.doctor_registerForm.get('clinicAddress')?.valueChanges.pipe(
      debounceTime(500), // Wait 500ms after the user stops typing
      distinctUntilChanged(),
      tap(value => {
        this.isSearchingAddress = typeof value === 'string' && value.length > 2;
      }),
      switchMap(value => {
        if (typeof value === 'string' && value.length > 2) {
          return this.nominatimService.searchAddress(value);
        }
        return of([]);
      })
    ).subscribe({
      next: (results) => {
        this.addressSuggestions = results;
        this.isSearchingAddress = false;
        this.showSuggestions = results.length > 0;
      },
      error: () => {
        this.isSearchingAddress = false;
        this.addressSuggestions = [];
      }
    });
  }

  // Handle user selecting an address from the dropdown
  selectAddress(address: LocationSuggestion) {
    // We emitEvent: false to prevent the valueChanges subscription from firing again
    this.doctor_registerForm.patchValue({
      clinicAddress: address.displayName
    }, { emitEvent: false });

    this.showSuggestions = false;
  }

  // Hide suggestions when clicking outside the input
  hideSuggestions() {
    // Small timeout to allow mousedown event on dropdown to fire first
    setTimeout(() => this.showSuggestions = false, 200);
  }

  submitPatient() {
    this.errorMessage = 'Αποτυχία εγγραφής ασθενή. Ελέγξτε τα στοιχεία και δοκιμάστε ξανά.';
    this.successMessage = 'Η εγγραφή ολοκληρώθηκε επιτυχώς. Μπορείτε πλέον να συνδεθείτε.';

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
      password: formData.pass,
      dateOfBirth: formData.birthDate,
      gender: formData.gender,
      phoneNumber: formData.phone
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Η εγγραφή ολοκληρώθηκε επιτυχώς. Μπορείτε πλέον να συνδεθείτε.';
        //this.errorMessage=undefined;
        setTimeout(() => {
          this.router.navigate(['/landing-page']);
        }, 1200);
      },
      error: error => {
        console.error('Patient registration failed:', error);
        this.isLoading = false;
        //this.successMessage = undefined;
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
      next: (unknown) => {
        /*  this.isLoading = false;
         this.errorMessage = '';
         this.successMessage = 'Η εγγραφή γιατρού ολοκληρώθηκε επιτυχώς. Μπορείτε πλέον να συνδεθείτε.'; */
        setTimeout(() => {
          this.isLoading = false;
          this.errorMessage = '';
          this.successMessage = 'Η εγγραφή γιατρού ολοκληρώθηκε επιτυχώς. Μπορείτε πλέον να συνδεθείτε.';
          setTimeout(() => {
            console.log("success");
            this.router.navigate(['/doctor']);
          }, 2400);
        }, 400);

      },
      error: error => {
        console.error('Doctor registration failed:', error);
        this.successMessage = '';
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