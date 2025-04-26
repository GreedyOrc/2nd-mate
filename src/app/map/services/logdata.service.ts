import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { Rope } from '../models/ropes.model';
import { CatchType } from '../models/catchtype.model';





@Injectable({
  providedIn: 'root'
})
export class LogdataService {

  ropeUpdated$ = new Subject<void>();
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
        })
      } else {
        this.getRopes();
      }

    })
  }


  getRopes(){
      if (!this.userID) {
      this.ropes = [];
      this.ropes$.next(this.ropes.slice()); 
      return;
    }
       this.http.get< Rope[] >(`https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`, {
      params: {
        'auth': this.authToken
      }
    }).subscribe(response => {
      if (response) {
        console.log('Get ropes response: ', response);
        this.ropes = response;
        this.ropes$.next(this.ropes.slice());
      }    
    });
  }


 //Old code - 29/03/2025

  // getRopes() {
  //   if (!this.userID) {
  //     this.ropes = [];
  //     this.ropes$.next([...this.ropes]); 
  //     return;
  //   }
  
  //   this.http.get<{ [key: string]: Rope }>(`https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`, {
  //     params: {
  //       'auth': this.authToken
  //     }
  //   }).subscribe(response => {
  //     if (response) {
  //       console.log('Get ropes response: ', response);
  
        
  //       this.ropes = Object.entries(response).map(([id, rope]) => ({
  //         id,  
  //         ...rope
  //       })).filter(rope => rope.live === true);
  
  //       this.ropes$.next([...this.ropes]); 
  //     } else {
  //       this.ropes = [];
  //       this.ropes$.next([]);
  //     }
  //   });
  // }

  storeLocation(rope: Rope) {
    this.ropes.push(rope);
    this.http.put<Rope>(`https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`,
      this.ropes,{ params: { 'auth': this.authToken } }).subscribe();
    this.ropes$.next(this.ropes.slice()); 
  }

  // ######### Old Code 29/03/2025 
  // storeLocation(rope: Rope) {
  //   this.http
  //     .post<{ name: string }>(
  //       `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`,
  //       rope,
  //       { params: { 'auth': this.authToken } }
  //     )
  //     .subscribe(response => {
  //       if (response && response.name) {
  //         const newRope = { ...rope, id: response.name };
  //         this.ropes.push(newRope);
  //         this.ropes$.next([...this.ropes]);
  //       }
  //     });
  
  //   console.log('ropes, ', this.ropes);
  // }

  // generateSortableNumber(typeOfCatch: string): number {
  //   const timestamp = Date.now(); 
  //   const hash = this.hashStringToNumber(typeOfCatch); 
  //   return Number(`${timestamp}${hash}`);
  // }
  
  // private hashStringToNumber(str: string): number {
  //   let hash = 0;
  //   for (let i = 0; i < str.length; i++) {
  //     hash = (hash << 5) - hash + str.charCodeAt(i);
  //   }
  //   return Math.abs(hash) % 1000; 
  // }

  getCatchTypes(): Observable<CatchType[]> {
    return this.http.get<{ [key: string]: CatchType }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/catchType.json`
        ,
        {params: {'auth': this.authToken}}).pipe(
        map((response) => response ? Object.values(response) : [])
      );
  }

  ///##### If you want to display old ropes - will need to do the same thing as we do for live ropes now. Need to buld an array of them. 

  updateRope(rope: Rope, rating: string) {
    let i = this.ropes.map(f => f.dropTime).indexOf(rope.dropTime);

    if (i !== -1) {
      const hauledRope = {
        ...this.ropes[i],
        rating: rating,
        halledTime: Date.now() 
      };

      // Post the updated rope to "hauled-ropes"
      this.http.post<Rope>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/haulled-ropes/${this.userID}.json`,
        hauledRope,
        { params: { 'auth': this.authToken } }
      ).subscribe();

      // Remove the rope from the local array
      this.ropes.splice(i, 1);

      // Update the "live-ropes" endpoint
      this.http.put<Rope[]>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`,
        this.ropes,
        { params: { 'auth': this.authToken } }
      ).subscribe();

      // Notify subscribers of the updated ropes list
      this.ropes$.next(this.ropes.slice());
      this.ropeUpdated$.next();
      
    }
  }

  getDept(startPos: GeolocationPosition, endPos: GeolocationPosition){
    console.log('position' , startPos, endPos);
     this.http.get('https://api.opentopodata.org/v1/emod2018?locations=' + startPos.coords.latitude + ',' + startPos.coords.longitude).subscribe(response => {
      if (response) {
        console.log('Get depth response: ', response);
        
        
      }    
    })
       
    


  }

}
