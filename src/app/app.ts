import { Component, OnInit, signal } from '@angular/core';
import { OnSameUrlNavigation, RouterOutlet } from '@angular/router';
import { AppLayout } from './core/app-layout/app-layout';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [AppLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('bluedot-front');
  
    constructor(private primeng: PrimeNG) {}

    ngOnInit() {
        this.primeng.ripple.set(true);
    }
}
