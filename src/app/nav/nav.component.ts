import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

    constructor(private breakpointObserver: BreakpointObserver, private auth: AngularFireAuth, private authService: AuthService) {}

    authenticated = false;
    authSubscription = new Subscription;

    ngOnInit(): void {
      this.authSubscription = this.auth.authState.subscribe(user =>{
        this.authenticated = user ? true : false;
      });
  }

  ngOnDestroy(): void{
    this.authSubscription.unsubscribe();
  }

  onLogout(){
    this.authService.logout()
  }

}
