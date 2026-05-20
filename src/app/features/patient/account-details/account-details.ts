import { Component, Input, OnInit } from '@angular/core';
import { Patient } from '../../../shared/domain/patient';
import { UserRole } from '../../../shared/domain/user';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../shared/services/patient-service';
import {
  AccountMeDto,
  AuthenticationServices,
  UpdateAccountMeDto,
} from '../../../shared/services/authentication-services';
import { DeleteAccountButton } from '../../../shared/components/delete-account-button/delete-account-button';

@Component({
  selector: 'app-account-details',
  imports: [ReactiveFormsModule, CommonModule, DeleteAccountButton],
  templateUrl: './account-details.html',
  styleUrl: './account-details.scss',
})
// Patient account details page: loads profile from /account/me and supports per-field inline editing
export class AccountDetails implements OnInit {
  @Input() patientInfo!: Patient;

  form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.minLength(6)]),
    role: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.pattern('^[0-9]{10}$')]),
  });

  // track which fields are currently being edited
  editing: { [key: string]: boolean } = {};

  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(
    private patientService: PatientService,
    private authenticationServices: AuthenticationServices
  ) {
    // PatientService currently returns stub data — /account/me in ngOnInit will override it
    const patient = this.patientService.getPatient();
    if (patient) {
      this.patientInfo = patient;
    } else {
      this.patientInfo = {
        id: 0,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: UserRole.Patient,
        dateOfBirth: new Date(),
        phoneNumber: '',
      };
    }
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
    const email = account.email ?? account.emailAddress ?? this.patientInfo.email ?? '';

    this.patientInfo = {
      ...this.patientInfo,
      firstName: account.firstName ?? this.patientInfo.firstName ?? '',
      lastName: account.lastName ?? this.patientInfo.lastName ?? '',
      email,
      phoneNumber: account.phoneNumber ?? this.patientInfo.phoneNumber ?? '',
      dateOfBirth: account.dateOfBirth
        ? new Date(account.dateOfBirth)
        : this.patientInfo.dateOfBirth,
    };
  }

  private patchFormFromModel() {
    if (!this.patientInfo) return;
    this.form.patchValue({
      firstName: this.patientInfo.firstName ?? '',
      lastName: this.patientInfo.lastName ?? '',
      email: this.patientInfo.email ?? '',
      password: '',
      role: this.patientInfo.role ?? '',
      dateOfBirth: this.formatDate(this.patientInfo.dateOfBirth),
      phoneNumber: this.patientInfo.phoneNumber ?? '',
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

  /* saveChanges() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

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
 */

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
        this.errorMessage =
          'Αποτυχία αποθήκευσης αλλαγών. Δοκιμάστε ξανά.';
        this.isSaving = false;
      },
    });
  }



  private buildPatchPayload(): UpdateAccountMeDto {
    const patch: UpdateAccountMeDto = {};

    for (const key of Object.keys(this.editing)) {
      if (!this.editing[key]) continue;

      const value = this.form.get(key)?.value;

      if (key === 'role') continue; // role is display-only and must not be sent to the API

      if (key === 'dateOfBirth') {
        patch.dateOfBirth = value ? value : null; // send null explicitly to clear the field
        continue;
      }

      (patch as any)[key] = value; // all other fields map directly by name
    }

    return patch;
  }

  private applyEditedFieldsToModel(): void {
    for (const key of Object.keys(this.editing)) {
      if (!this.editing[key]) continue;

      const value = this.form.get(key)?.value;

      if (key === 'dateOfBirth') {
        this.patientInfo.dateOfBirth = value ? new Date(value) : this.patientInfo.dateOfBirth;
        continue;
      }

      // @ts-ignore - dynamic assignment to Patient
      this.patientInfo[key] = value;
    }
  }

  cancelChanges() {
    this.patchFormFromModel();
    this.editing = {};
  }

  private formatDate(d: any) {
    if (!d) return '';
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
