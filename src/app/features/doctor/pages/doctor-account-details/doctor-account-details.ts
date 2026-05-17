import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Doctor } from '../../../../shared/domain/doctor';
import { DoctorService } from '../../../../shared/services/doctor-service';

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

  constructor(private doctorService: DoctorService) {
    this.doctorInfo = this.doctorService.getDoctorProfile();
  }

  ngOnInit(): void {
    this.patchFormFromModel();
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

    for (const key of Object.keys(this.editing)) {
      if (!this.editing[key]) {
        continue;
      }

      const value = this.form.get(key)?.value;

      if (key === 'specialty') {
        this.doctorInfo.specialty = {
          id: this.doctorInfo.specialty?.id ?? 1,
          name: value
        };

        continue;
      }

      // dynamic assignment, same logic style as patient account page
      (this.doctorInfo as any)[key] = value;
    }

    this.editing = {};
  }

  cancelChanges() {
    this.patchFormFromModel();
    this.editing = {};
  }
}