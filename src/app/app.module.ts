import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AboutMainComponent } from './about/components/about-main/about-main.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { DataMainComponent } from './data/components/data-main/data-main.component';
import { MapBaseComponent } from './map/components/map-base/map-base.component';
import { MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatCardModule} from '@angular/material/card';
import { LoadingIconComponent } from './shared/components/loading-icon/loading-icon.component';
import { FormsModule, ReactiveFormsModule  }   from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AboutMainComponent,
    LoginComponent,
    RegisterComponent,
    DataMainComponent,
    MapBaseComponent,
    LoadingIconComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule, 
    MatFormFieldModule,
    MatCardModule,
    FormsModule, 
    ReactiveFormsModule,
    MatInputModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
