import { Component } from '@angular/core';
import { AuthenticationServices } from '../../services/authentication-services';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-account-button',
  imports: [DialogModule,],
  templateUrl: './delete-account-button.html',
  styleUrl: './delete-account-button.scss',
})
export class DeleteAccountButton {
  visible:boolean = false;
  constructor(private authService:AuthenticationServices, private router:Router){

  }

  deleteAccount(){
    this.authService.deleteMe().subscribe({
      next:() =>{
        console.log("acc deleted successfully");
        setTimeout(()=>{
          this.router.navigate(['/landing-page']);
        }, 1000);
      },
      error:()=>{
        console.log("acc deletion failure!");
      }
    })
  
  }
}
