import { Component } from '@angular/core';
import { ReturnButton } from '../return-button/return-button';

@Component({
  selector: 'app-error-500',
  imports: [ReturnButton],
  templateUrl: './error-500.html',
  styleUrl: './error-500.scss',
})
export class Error500 {}
