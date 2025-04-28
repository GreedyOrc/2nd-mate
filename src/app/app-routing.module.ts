import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataMainComponent } from './data/components/data-main/data-main.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { LoginComponent } from './auth/components/login/login.component';
import { AboutMainComponent } from './about/components/about-main/about-main.component';
import { AuthGuardService } from './auth/services/auth-guard.service';
import { MapCardComponent } from './map/components/map-card/map-card.component';

const routes: Routes = [
    {path: 'about', component: AboutMainComponent}, 
    {path: 'map', component: MapCardComponent, canActivate: [AuthGuardService]},
    {path: 'login', component: LoginComponent},
    {path: 'register', component:RegisterComponent},
    {path: 'data', component:DataMainComponent, canActivate: [AuthGuardService]},
    {path: '', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  

}
