import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Rope } from '../models/ropes.model';
import { CatchType } from '../models/catchtype.model';




@Injectable({
  providedIn: 'root'
})
export class LogdataService {

  userID!: string | null;
  ropes: Rope[] = [];
  catchtypes: CatchType[] = [];
  ropes$ = new BehaviorSubject<Rope[]>([]);
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
      this.ropes$.next([...this.ropes]); // Ensure a new reference
      return;
    }
  
    this.http.get<{ [key: string]: Rope }>(`https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`, {
      params: {
        'auth': this.authToken
      }
    }).subscribe(response => {
      if (response) {
        console.log('Get ropes response: ', response);
  
        // Convert response object into an array with IDs preserved
        this.ropes = Object.entries(response).map(([id, rope]) => ({
          id,  // Preserve Firebase ID
          ...rope
        }));
  
        this.ropes$.next([...this.ropes]); // Ensure a new array reference
      } else {
        this.ropes = [];
        this.ropes$.next([]);
      }
    });
  }

    // getRopes(){
    //   if (!this.userID) {
    //         this.ropes = [];
    //         this.ropes$.next([...this.ropes]);
    //         return;
    //       }
    //   this.http.get<Rope[]>(`https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`, {
    //     params:{
    //       'auth': this.authToken
    //     }
    //   }).subscribe(response => {
    //     if(response) {
    //       console.log('Get ropes response: ', response);
    //       this.ropes = response;
    //       this.ropes$.next(this.ropes.slice());
    //     }
    //   })
    // }



  //Old Get Response - Testing 28/03/2028
  // getRopes() {
  //   if (!this.userID) {
  //     this.ropes = [];
  //     this.ropes$.next(this.ropes.slice());
  //     return;
  //   }
  //     //will need to change this. (shouldn't need to do any mapping once complete)
  //   this.http
  //     .get<{ [key: string]: Rope }>(
  //       `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`
  //       ,
  //       {params: {'auth': this.authToken}}).subscribe((response) => {
  //         if (response) {
  //           // console.log('before mapping ' + response)
  //           const ropesArray = Object.entries(response).map(([id, rope]) => ({
  //             id, 
  //             ...rope,
  //           }));

  //           const liveRopes = ropesArray.filter(rope => rope.live === true);

  //           // console.log('Filtered Live Ropes:', ropesArray);

  //           this.ropes = liveRopes;
  //           this.ropes$.next(this.ropes.slice());
  //         } else {
  //           this.ropes = [];
  //           this.ropes$.next([]);
  //         }
  //       });

    // ######## Old items

    // this.http.get<Rope[]>('https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/' + this.userID + '.json').subscribe(response => {
    //   console.log('Get Ropes!'); 
    //   console.log(response);        
    //   this.ropes = response;
    //   this.ropes$.next(this.ropes.slice());
    // })

  // }

  //##TODO need to change to use models throughout all the calls. 

  storeLocation(rope: Rope) {
    this.http
      .post<{ name: string }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`,
        rope,
        { params: { 'auth': this.authToken } }
      )
      .subscribe(response => {
        if (response && response.name) {
          // Create a new Rope object with the Firebase-generated ID
          const newRope = { ...rope, id: response.name };
          this.ropes.push(newRope);
          this.ropes$.next([...this.ropes]); // Ensure Angular detects the change
        }
      });
  
    console.log('ropes, ', this.ropes);
  }

  generateSortableNumber(typeOfCatch: string): number {
    const timestamp = Date.now(); 
    const hash = this.hashStringToNumber(typeOfCatch); 
    return Number(`${timestamp}${hash}`);
  }
  
  private hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
    }
    return Math.abs(hash) % 1000; 
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
    this.http
      .patch(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}/${ropeId}.json`,
        updatedData,
        { params: { 'auth': this.authToken } }
      )
      .subscribe(() => {
        this.ropes = this.ropes.map(rope => rope.ropeid === ropeId ? { ...rope, ...updatedData } : rope);
        this.ropes$.next([...this.ropes]); // Ensure the update is reflected
      });
  }

  // updateRope(ropeId: string, updatedData: Partial<Rope>) {
  //   // console.log('inside Update Rope');
  //   // console.log('Rope ID:', ropeId);
  //   // console.log('Updated Data:', updatedData);

  //   this.http
  //     .patch<{ name: string }>(
  //       `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}/${ropeId}.json`,
  //       updatedData,
        
  //       {
  //         params: {
  //           'auth': this.authToken
  //         }
  //       }
  //     )
  //     .subscribe(() => {
  //       this.ropes$.next(this.ropes);
  //     });
  // }




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
