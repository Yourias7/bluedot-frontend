import { Component, Input, OnInit } from '@angular/core';
import { Patient } from '../../../shared/domain/patient';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../shared/services/patient-service';

@Component({
  selector: 'app-account-details',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './account-details.html',
  styleUrl: './account-details.scss',
})
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

  constructor(private patientService: PatientService) {
    const patient = this.patientService.getPatient();
    if (patient) {
      this.patientInfo = patient;
    }
  }

  ngOnInit(): void {
    this.patchFormFromModel();
  }

  private patchFormFromModel() {
    if (!this.patientInfo) return;
    this.form.patchValue({
      firstName: this.patientInfo.firstName ?? '',
      lastName: this.patientInfo.lastName ?? '',
      email: this.patientInfo.email ?? '',
      password: this.patientInfo.password ?? '',
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

  saveChanges() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    // copy only edited fields back to the model
    for (const key of Object.keys(this.editing)) {
      if (!this.editing[key]) continue;
      const value = this.form.get(key)?.value;
      if (key === 'dateOfBirth') {
        this.patientInfo.dateOfBirth = value ? new Date(value) : value;
      } else {
        // @ts-ignore - dynamic assignment to Patient
        this.patientInfo[key] = value;
      }
    }
    // clear editing state
    this.editing = {};
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
