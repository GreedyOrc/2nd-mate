import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: AngularFireAuth, private router: Router){  }

  register(email: string, password: string){
    return this.auth.createUserWithEmailAndPassword(email, password)
    .then(res => {
      this.router.navigate(['']);
   }).catch(error => {
    if(error.code == 'auth/email-already-in-use'){
      return 'An account already exisits with this email address'
    }
    if(error.code =='auth/invalid-email'){
      return 'Provided email address is invalid'
    }
    return 'An unknown error has occured'
  })
  }

  login(email: string, password: string):Promise<string | void> {
    return this.auth.signInWithEmailAndPassword(email, password)
    .then(res => {
         this.router.navigate(['/map']);
      }
    )
    .catch(error => {
      if(error.code == 'auth/invalid-login-credentials'){
        return 'Invalid login details'
      }
      return 'An unknown error has occured'
    })
  }

  logout(){
    this.auth.signOut();
    this.router.navigate(['']);
  }


}
