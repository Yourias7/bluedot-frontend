import { Component, Input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [DialogModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  @Input() isOpen: boolean = false;
}
