import { Component } from '@angular/core';
import { Logo } from '../common/logo/logo';


@Component({
  selector: 'app-footer',
  imports: [Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
