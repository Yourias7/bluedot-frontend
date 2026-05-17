import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [DialogModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  @Input() isOpen: boolean = false;
  @Input() hasFailedLogin:boolean = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  constructor(private router:Router){

  }

  redirect(){
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.router.navigate(['/register']);
  }

  handleHide() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
