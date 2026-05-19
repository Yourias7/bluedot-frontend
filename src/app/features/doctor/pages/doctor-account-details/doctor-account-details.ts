import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NominatimService } from '../../../../shared/services/nominatim.service';
import { Doctor } from '../../../../shared/domain/doctor';
import { Specialty } from '../../../../shared/domain/specialty';
import { UserRole } from '../../../../shared/domain/user';
import { DoctorService } from '../../../../shared/services/doctor-service';
import { DoctorSearchService } from '../../../../shared/services/doctor-search-service';
import {
  AccountMeDto,
  AuthenticationServices,
  UpdateAccountMeDto,
} from '../../../../shared/services/authentication-services';
import { LocationSuggestion } from '../../../../shared/services/nominatim.service';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DeleteAccountButton } from '../../../../shared/components/delete-account-button/delete-account-button';


@Component({
  selector: 'app-doctor-account-details',
  imports: [CommonModule, ReactiveFormsModule, DeleteAccountButton],
  templateUrl: './doctor-account-details.html',
  styleUrl: './doctor-account-details.scss'
})
export class DoctorAccountDetails implements OnInit {
  doctorInfo!: Doctor;

  form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.minLength(6)]),
    phoneNumber: new FormControl('', [Validators.pattern('^[0-9]{10}$')]),
    clinicAddress: new FormControl('', [Validators.required]),
    yearsOfExperience: new FormControl(0, [Validators.required, Validators.min(0)]),
    bio: new FormControl('', [Validators.required]),
  });

  editing: { [key: string]: boolean } = {};

  specialties: Specialty[] = [];

  isLoading = false;
  isSaving = false;
  errorMessage = '';

    // Autocomplete state variables
    addressSuggestions: LocationSuggestion[] = [];
    isSearchingAddress = false;
    showSuggestions = false;
  

  constructor(
    private doctorService: DoctorService,
    private authenticationServices: AuthenticationServices,
    private doctorSearchService: DoctorSearchService,
    private nomatimService:NominatimService
  ) {
    this.doctorInfo = this.doctorService.getDoctorProfile() ?? {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.Doctor,
      bio: '',
      clinicAddress: '',
      phoneNumber: '',
      yearsOfExperience: 0,
    };
  }

  ngOnInit(): void {
    //this.loadSpecialties();
    this.loadAccount();
    this.setupAddressAutocomplete();
  }

  private loadAccount(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authenticationServices.getMe().subscribe({
      next: (account) => {
        this.applyAccountToModel(account);
        this.patchFormFromModel();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load account:', error);
        this.errorMessage = 'Αποτυχία φόρτωσης στοιχείων λογαριασμού.';
        this.patchFormFromModel();
        this.isLoading = false;
      },
    });
  }

  private applyAccountToModel(account: AccountMeDto): void {
    const email = account.email ?? account.emailAddress ?? this.doctorInfo.email ?? '';
    const specialty =
      account.specialty ??
      (account.specialties && account.specialties.length > 0
        ? account.specialties[0]
        : this.doctorInfo.specialty);

    this.doctorInfo = {
      ...this.doctorInfo,
      firstName: account.firstName ?? this.doctorInfo.firstName ?? '',
      lastName: account.lastName ?? this.doctorInfo.lastName ?? '',
      email,
      phoneNumber: account.phoneNumber ?? this.doctorInfo.phoneNumber ?? '',
      clinicAddress: account.clinicAddress ?? this.doctorInfo.clinicAddress ?? '',
      yearsOfExperience: account.yearsOfExperience ?? this.doctorInfo.yearsOfExperience ?? 0,
      bio: account.bio ?? this.doctorInfo.bio ?? ''
    };
  }

  private patchFormFromModel() {
    this.form.patchValue({
      firstName: this.doctorInfo.firstName ?? '',
      lastName: this.doctorInfo.lastName ?? '',
      email: this.doctorInfo.email ?? '',
      password: this.doctorInfo.password ?? '',
      phoneNumber: this.doctorInfo.phoneNumber ?? '',
      clinicAddress: this.doctorInfo.clinicAddress ?? '',
      yearsOfExperience: this.doctorInfo.yearsOfExperience ?? 0,
      bio: this.doctorInfo.bio ?? ''
    });
  }

  editField(field: string) {
    this.editing[field] = true;
  }

  getControl(name: string) {
    return this.form.get(name) as FormControl;
  }

  isAnyEditing(): boolean {
    return Object.values(this.editing).some(Boolean);
  }

  saveChanges() {
 
    let hasInvalidFields = false;

    //safeguard for non edited fields
    for (const key of Object.keys(this.editing)) {

      if (!this.editing[key]) continue;

      const control = this.form.get(key);

      control?.markAsTouched();
      control?.updateValueAndValidity();

      if (control?.invalid) {
        hasInvalidFields = true;
      }
    }

    if (hasInvalidFields) return;

    const patch = this.buildPatchPayload();

    if (Object.keys(patch).length === 0) {
      this.editing = {};
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.authenticationServices.updateMe(patch).subscribe({
      next: (account) => {
        this.applyEditedFieldsToModel();
        if (account) {
          this.applyAccountToModel(account);
        }
        this.patchFormFromModel();
        this.editing = {};
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Failed to update account:', error);
        this.errorMessage = 'Αποτυχία αποθήκευσης αλλαγών. Δοκιμάστε ξανά.';
        this.isSaving = false;
      },
    });
  }

  private buildPatchPayload(): UpdateAccountMeDto {
    const patch: UpdateAccountMeDto = {};

    for (const key of Object.keys(this.editing)) {
      if (!this.editing[key]) {
        continue;
      }

      const value = this.form.get(key)?.value;

      if (key === 'specialty') {
        const selected = this.findSpecialtyById(value);
        if (selected) {
          patch.specialty = { id: selected.id, name: selected.name };
        }
        continue;
      }

      (patch as any)[key] = value;
    }

    return patch;
  }

  private applyEditedFieldsToModel(): void {
    for (const key of Object.keys(this.editing)) {
      if (!this.editing[key]) {
        continue;
      }

      const value = this.form.get(key)?.value;

      if (key === 'specialty') {
        const selected = this.findSpecialtyById(value);
        if (selected) {
          this.doctorInfo.specialty = { id: selected.id, name: selected.name };
        }
        continue;
      }

      // dynamic assignment, same logic style as patient account page
      (this.doctorInfo as any)[key] = value;
    }
  }

  private findSpecialtyById(id: unknown): Specialty | undefined {
    if (id === null || id === undefined || id === '') {
      return undefined;
    }
    const numericId = Number(id);
    return this.specialties.find((specialty) => specialty.id === numericId);
  }

  cancelChanges() {
    this.patchFormFromModel();
    this.editing = {};
  }

  ///location stuff

  // Set up reactive listener for the clinic address field
    setupAddressAutocomplete() {
      this.form.get('clinicAddress')?.valueChanges.pipe(
        debounceTime(500), // Wait 500ms after the user stops typing
        distinctUntilChanged(),
        tap(value => {
          this.isSearchingAddress = typeof value === 'string' && value.length > 2;
        }),
        switchMap(value => {
          if (typeof value === 'string' && value.length > 2) {
            return this.nomatimService.searchAddress(value);
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
      this.form.patchValue({
        clinicAddress: address.displayName
      }, { emitEvent: false }); 
      
      this.showSuggestions = false;
    }
  
    // Hide suggestions when clicking outside the input
    hideSuggestions() {
      // Small timeout to allow mousedown event on dropdown to fire first
      setTimeout(() => this.showSuggestions = false, 200);
    }
  
}