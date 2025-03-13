import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  submit = false;
  hide = true;
  loading = false;
  error:string | void = "";

  constructor(private authService: AuthService){

  }

  registerForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)])
  })

  async onSubit(){
    if(this.submit){
      this.loading = true;
      this.error = "";
      const {email, password} = this.registerForm.value;
      this.error = await this.authService.register(email!, password!);
      this.loading = false;
    }
    
  }
  
  getEmailError(): string{
    if(this.registerForm.get('email')?.errors?.['email']){
      return "Invalid email address"
    }
    if(this.registerForm.get('email')?.errors?.['required']){
      return "Please provide an email address"
    }
    return "an unknown error occured"
  }

  getPasswordError(): string{
    if(this.registerForm.get('password')?.errors?.['minlength']){
      return "Invalid password - minimum length is 6 characters"
    }
    if(this.registerForm.get('password')?.errors?.['required']){
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
