import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs';

interface Rope {
  time: number; // or Date if you prefer
  live: boolean;
  startLocation: GeolocationPosition;
  endLocation: GeolocationPosition;
};


@Injectable({
  providedIn: 'root'
})
export class LogdataService {

  userID!: string | null;
  ropes: Rope[] = [];
  ropes$ = new BehaviorSubject<Rope[]>([]);

  constructor(private http: HttpClient, private auth: AngularFireAuth) {
    this.auth.authState.subscribe((user) => {
      this.userID = user ? user.uid : null;
      this.getRopes();
    });
  }

  getRopes() {
    if (!this.userID) {
      this.ropes = [];
      this.ropes$.next(this.ropes.slice());
      return;
    }

    this.http
      .get<{ [key: string]: Rope }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/${this.userID}.json`
      )
      .subscribe((response) => {
        if (response) {
          const ropesArray = Object.values(response).filter((rope) => rope.live);
          this.ropes = ropesArray;
          this.ropes$.next(this.ropes.slice());
        } else {
          this.ropes = [];
          this.ropes$.next([]);
        }
      });





    // ######## Old items

    // this.http.get<Rope[]>('https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/' + this.userID + '.json').subscribe(response => {
    //   console.log('Get Ropes!'); 
    //   console.log(response);        
    //   this.ropes = response;
    //   this.ropes$.next(this.ropes.slice());
    // })

  }

  storeLocation(startLocation: GeolocationPosition, endLocation: GeolocationPosition) {
    const time = Date.now();
    const live = true;
    const ropeEntry: Rope = { time, live, startLocation, endLocation };

    this.ropes.push(ropeEntry);
    this.http
      .post<{ name: string }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/${this.userID}.json`,
        ropeEntry
      )
      .subscribe(() => {
        this.ropes$.next(this.ropes.slice());
      });

    // ###### Old code  
    //   this.ropes.push(ropeEntry);
    //   this.http.post<Rope[]>('https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/' + this.userID + '.json', {ropeEntry}).subscribe();
    //   this.ropes$.next(this.ropes.slice());
    // }

  }

}
