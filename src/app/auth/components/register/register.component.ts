import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {


  
  loading = false;
  error:string | void = "";

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)])
  })

  async onSubit(){
    this.loading = true;
    this.error = "";
    
  }
  
  getEmailError(): string{
    if(this.loginForm.get('email')?.errors?.['email']){
      return "Invalid email address"
    }
    if(this.loginForm.get('email')?.errors?.['required']){
      return "Please provide an email address"
    }
    return "an unknown error occured"
  }

  getPasswordError(): string{
    if(this.loginForm.get('password')?.errors?.['minlength']){
      return "Invalid password - minimum length is 6 characters"
    }
    if(this.loginForm.get('password')?.errors?.['required']){
      return "Please provide an password"
    }
    return "an unknown error occured"
  }



  hide = true;
}
