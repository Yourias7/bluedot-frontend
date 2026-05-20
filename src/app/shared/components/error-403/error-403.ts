// Shown when a user navigates to a route they don't have permission to access (403 Forbidden)
import { Component } from '@angular/core';
import { ReturnButton } from '../return-button/return-button';

@Component({
  selector: 'app-error-403',
  imports: [ReturnButton],
  templateUrl: './error-403.html',
  styleUrl: './error-403.scss',
})
export class Error403 {}
