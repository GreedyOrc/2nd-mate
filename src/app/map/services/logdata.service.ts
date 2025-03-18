import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

interface Rope {
  time: number; // or Date if you prefer
  startLocation: GeolocationPosition;
  endLocation: GeolocationPosition;
};


@Injectable({
  providedIn: 'root'
})
export class LogdataService {

  userID!: string | null;
  ropes : Rope[] = [];

  constructor(private http: HttpClient, private auth: AngularFireAuth) { 
    this.ropes = [];
    this.auth.authState.subscribe(user => {
      this.userID = user ? user.uid : null;
    });
  }

  storeLocation(startLocation: GeolocationPosition, endLocation: GeolocationPosition){
    const time = Date.now();
    const ropeEntry: Rope = { time, startLocation, endLocation };
    this.ropes.push(ropeEntry);
    this.http.post('https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/' + this.userID + '.json', {ropeEntry}).subscribe();
  }


}
