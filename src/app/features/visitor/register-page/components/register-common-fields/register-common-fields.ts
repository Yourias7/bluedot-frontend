import { Component, Input} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-register-common-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './register-common-fields.html',
  styleUrl: './register-common-fields.scss',
})
export class RegisterCommonFields {
 @Input() formGroup!: FormGroup;
}
