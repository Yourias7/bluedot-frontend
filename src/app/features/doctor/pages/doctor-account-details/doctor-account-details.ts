import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Doctor } from '../../../../shared/domain/doctor';
import { UserRole } from '../../../../shared/domain/user';
import { DoctorService } from '../../../../shared/services/doctor-service';
import {
  AccountMeDto,
  AuthenticationServices,
  UpdateAccountMeDto,
} from '../../../../shared/services/authentication-services';

@Component({
  selector: 'app-doctor-account-details',
  imports: [CommonModule, ReactiveFormsModule],
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
    specialty: new FormControl('', [Validators.required])
  });

  editing: { [key: string]: boolean } = {};

  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(
    private doctorService: DoctorService,
    private authenticationServices: AuthenticationServices
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
    this.loadAccount();
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
      bio: account.bio ?? this.doctorInfo.bio ?? '',
      specialty,
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
      bio: this.doctorInfo.bio ?? '',
      specialty: this.doctorInfo.specialty?.name ?? ''
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
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

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
        patch.specialty = {
          id: this.doctorInfo.specialty?.id ?? 0,
          name: value,
        };
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
        this.doctorInfo.specialty = {
          id: this.doctorInfo.specialty?.id ?? 0,
          name: value,
        };
        continue;
      }

      // dynamic assignment, same logic style as patient account page
      (this.doctorInfo as any)[key] = value;
    }
  }

  cancelChanges() {
    this.patchFormFromModel();
    this.editing = {};
  }
}