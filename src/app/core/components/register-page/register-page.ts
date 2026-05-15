import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { first } from 'rxjs';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, TabsModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: [''],
      pass: [''],
      confirmPass:[''],
      firstName:[''],
      lastName:[''],
      phone:[''],
      birthDate:[''],
      gender:[''],
      terms:['']

    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      console.log('Form Data:', formData);
      // Here you can add logic to send the form data to your backend API
    }
  }
}
