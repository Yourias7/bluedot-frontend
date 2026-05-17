import { Component } from '@angular/core';
import { ReturnButton } from "../return-button/return-button";

@Component({
  selector: 'app-error-404',
  imports: [ReturnButton],
  templateUrl: './error-404.html',
  styleUrl: './error-404.scss',
})
export class Error404 {}
