import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, map, Observable } from 'rxjs';

interface Rope {
  time: number; // or Date if you prefer
  live: boolean;
  startLocation: GeolocationPosition;
  endLocation: GeolocationPosition;
  catchtype: string;
  colour: string;
  rating: string;
};

interface CatchType {
  name: string,
  colour: string
};

@Injectable({
  providedIn: 'root'
})
export class LogdataService {

  userID!: string | null;
  ropes: Rope[] = [];
  ropes$ = new BehaviorSubject<Rope[]>([]);
  catchtypes: CatchType[] = [];
  catchtypes$ = new BehaviorSubject<CatchType[]>([]);

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
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`
      )
      .subscribe((response) => {
        if (response) {
          const ropesArray = Object.values(response);
          const liveRopes = ropesArray.filter(rope => rope.live === true);

          console.log('Filtered Live Ropes:', liveRopes);

          this.ropes = liveRopes;
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

  storeLocation(startLocation: GeolocationPosition, endLocation: GeolocationPosition, catchtype: string, colour: string) {
    const time = Date.now();
    const live = true;
    const rating = "0";
    const ropeEntry: Rope = { time, live, startLocation, endLocation, catchtype, colour, rating};

    this.ropes.push(ropeEntry);
    this.http
      .post<{ name: string }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`,
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

  getCatchTypes(): Observable<CatchType[]> {
    return this.http
      .get<{ [key: string]: CatchType }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/catchType.json`
      )
      .pipe(
        map((response) => response ? Object.values(response) : [])
      );
  }

  updateRope(ropeId: string, updatedData: Partial<Rope>): Observable<Rope> {
    console.log('inside Update Rope');
    console.log('Rope ID: ' + ropeId);
    console.log('Rating: ' + updatedData.rating);
    const url = `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}/${ropeId}.json`;
  
    return this.http.put<Rope>(url, updatedData).pipe(
      map((response) => {
        const index = this.ropes.findIndex(rope => rope.time === updatedData.time);
        if (index !== -1) {
          this.ropes[index] = { ...this.ropes[index], ...updatedData };
        }
        this.ropes$.next(this.ropes.slice());
        return response;
      })
    );
  }




  //########### old attempt at get catch types. 
  // getCatchTypes() {
  //   this.http
  //     .get<{ [key: string]: CatchType }>(
  //       `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/catchType.json`
  //     )
  //     .subscribe((response) => {
  //       if (response) {
  //         const catchArray = Object.values(response);
                  
  //         console.log('Got catch types!', catchArray)

  //         this.catchtypes = catchArray;
  //         this.catchtypes$.next(this.catchtypes.slice());
  //       } else {
  //         this.catchtypes = [];
  //         this.catchtypes$.next([]);
  //       }
  //     });

  // }
}
