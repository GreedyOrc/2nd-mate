import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, map, Observable } from 'rxjs';

interface Rope {
  id?: string;
  time: number; // or Date if you prefer
  live: boolean;
  startLocation: GeolocationPosition;
  endLocation: GeolocationPosition;
  catchtype: string;
  colour: string;
  rating?: string;
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
  authToken: any;

  constructor(private http: HttpClient, private auth: AngularFireAuth) {
    this.auth.authState.subscribe(user => {
      this.userID = user ? user.uid : null;
      if (this.userID) {
        user?.getIdToken(false).then(token => {
          this.authToken = token;
          this.getRopes();
          this.getCatchTypes()
        })
      } else {
        this.getRopes();
        this.getCatchTypes()
      }

    })
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
        ,
        {params: {'auth': this.authToken}}).subscribe((response) => {
          if (response) {
            // console.log('before mapping ' + response)
            const ropesArray = Object.entries(response).map(([id, rope]) => ({
              id, // Store the Firebase key
              ...rope, // Spread the rope object properties
            }));

            const liveRopes = ropesArray.filter(rope => rope.live === true);

            // console.log('Filtered Live Ropes:', ropesArray);

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
    const ropeEntry: Rope = { time, live, startLocation, endLocation, catchtype, colour };

    this.ropes.push(ropeEntry);
    this.http
      .post<{ name: string }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`,
        ropeEntry,

        {
          params: {
            'auth': this.authToken
          }
        }        
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
    return this.http.get<{ [key: string]: CatchType }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/catchType.json`
        ,
        {params: {'auth': this.authToken}}).pipe(
        map((response) => response ? Object.values(response) : [])
      );
  }

  updateRope(ropeId: string, updatedData: Partial<Rope>) {
    // console.log('inside Update Rope');
    // console.log('Rope ID:', ropeId);
    // console.log('Updated Data:', updatedData);

    this.http
      .patch<{ name: string }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}/${ropeId}.json`,
        updatedData,
        
        {
          params: {
            'auth': this.authToken
          }
        }
      )
      .subscribe(() => {
        this.ropes$.next(this.ropes);
      });
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
