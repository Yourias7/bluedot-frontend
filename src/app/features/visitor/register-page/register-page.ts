import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { RegisterCommonFields } from './components/register-common-fields/register-common-fields';
import { first } from 'rxjs';
import { validate } from '@angular/forms/signals';
import { ListboxModule } from 'primeng/listbox';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, TabsModule, RegisterCommonFields, FormsModule, ListboxModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  items: Specialty[] = [];
  selected_items: Specialty[] = [];
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
    });

    this.doctor_registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', Validators.required),
      birthDate: new FormControl('', Validators.required),
      gender: new FormControl(''),
      specialization: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
    });
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
    }
  }
}
