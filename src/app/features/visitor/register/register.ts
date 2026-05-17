import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { RegisterCommonFields } from './components/register-common-fields/register-common-fields';
import { ListboxModule } from 'primeng/listbox';
import { DoctorSearchService } from '../../../shared/services/doctor-search-service';
import { Specialty } from '../../../shared/domain/specialty';
import { AuthenticationServices } from '../../../shared/services/authentication-services'; // <-- Add this import

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TabsModule, FormsModule, ListboxModule, RegisterCommonFields],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  items: Specialty[] = [];
  selected_items: Specialty[] = [];
  patient_registerForm: FormGroup;
  doctor_registerForm: FormGroup;

  // Inject the auth service
  constructor(
    private doctorSearchService: DoctorSearchService,
    private authService: AuthenticationServices 
  ) {

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
      pass: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")]),
      confirmPass: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern("^[0-9]{10}$")]),
      birthDate: new FormControl('', Validators.required),
      gender: new FormControl(''),
      specialization: new FormControl('', [Validators.required]),
      terms: new FormControl(false, Validators.requiredTrue),
    });
  }

  //listbox stuff


  onSubmit() {
    // 1. Handle Patient Registration
    if (this.patient_registerForm.valid) {
      const formData = this.patient_registerForm.value;
      
      this.authService.registerPatient(formData).subscribe({
        next: (response) => {
          console.log('Patient registered successfully!', response);
          // TODO: Show success message, close dialog, or auto-login
        },
        error: (err) => {
          console.error('Patient registration failed', err);
        }
      });
    }

    // 2. Handle Doctor Registration
    if (this.doctor_registerForm.valid) {
      const formData = this.doctor_registerForm.value;
      
      this.authService.registerDoctor(formData).subscribe({
        next: (response) => {
          console.log('Doctor registered successfully!', response);
          // TODO: Show success message
        },
        error: (err) => {
          console.error('Doctor registration failed', err);
        }
      });
    }
  }
}