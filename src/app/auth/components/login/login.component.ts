import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor() {
    
  }

  submit = false;
  hide = true;
  loading = false;
  error:string | void = "";

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required , Validators.minLength(6)]) //min length required for firebase
  })

  async onSubit(){
    if(this.submit){
      this.loading = true;
      this.error = "";
    }
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

  public hideText(): void {
    this.submit = false;
    this.hide = !this.hide;
  }

  public submitClicked(): void {
    this.submit = true;
  }


}


