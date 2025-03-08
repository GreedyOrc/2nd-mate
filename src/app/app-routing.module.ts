import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapBaseComponent } from './map/components/map-base/map-base.component';
import { DataMainComponent } from './data/components/data-main/data-main.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { LoginComponent } from './auth/components/login/login.component';
import { AboutMainComponent } from './about/components/about-main/about-main.component';

const routes: Routes = [
   {path: 'about', component: AboutMainComponent}, 
    {path: 'map', component: MapBaseComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component:RegisterComponent},
    {path: 'data', component:DataMainComponent},
    {path: '', component: MapBaseComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  

}
