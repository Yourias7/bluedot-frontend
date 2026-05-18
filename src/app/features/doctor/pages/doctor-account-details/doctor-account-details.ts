import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
    specialty: new FormControl<number | null>(null, [Validators.required])
  });

  editing: { [key: string]: boolean } = {};

  specialties: Specialty[] = [];

  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(
    private doctorService: DoctorService,
    private authenticationServices: AuthenticationServices,
    private doctorSearchService: DoctorSearchService
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
    this.loadSpecialties();
    this.loadAccount();
  }

  private loadSpecialties(): void {
    this.doctorSearchService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties ?? [];
        // Re-patch the form so the dropdown selection matches the loaded specialty.
        this.patchFormFromModel();
      },
      error: (error) => {
        console.error('Failed to load specialties:', error);
        this.specialties = [];
      },
    });
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
      specialty: this.doctorInfo.specialty?.id ?? null
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
}