import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class LogdataService {

  userID!: string | null;
  ropes: GeolocationPosition[] = [];

  constructor(private http: HttpClient, private auth: AngularFireAuth) { 
    this.auth.authState.subscribe(user => {
      this.userID = user ? user.uid : null;
    });
  }

  storeLocation(location: GeolocationPosition){
    this.ropes.push(location);
    this.http.put('https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/' + this.userID + '.json', {location}).subscribe();
  }


}
