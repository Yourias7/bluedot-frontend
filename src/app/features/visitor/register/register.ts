import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { RegisterCommonFields } from './components/register-common-fields/register-common-fields';
import { ListboxModule } from 'primeng/listbox';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';

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

  constructor(private doctorSearchService: DoctorSearchService) {

    this.items = this.doctorSearchService.getSpecialties();

    this.patient_registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', Validators.pattern("^[0-9]{10}$")),
      birthDate: new FormControl('', Validators.required),
      gender: new FormControl(''),
      terms: new FormControl(false, Validators.requiredTrue),
    }, { validators: passwordsMatchValidator });

    this.doctor_registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', Validators.required),
      birthDate: new FormControl('', Validators.required),
      gender: new FormControl(''),
      specialization: new FormControl([], Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
      bio: new FormControl('', [Validators.required, Validators.maxLength(1000)])
    }, { validators: passwordsMatchValidator });
  }

  //listbox stuff


  onSubmit() {
    if (this.patient_registerForm.valid) {
      const formData = this.patient_registerForm.value;
      console.log('Patient Data:', formData);
    }
    if (this.doctor_registerForm.valid) {
      const formData = this.doctor_registerForm.value;
      console.log('Doctor Data:', formData);
      console.log('Selected specializations:', formData.specialization);
    }
  }
}
