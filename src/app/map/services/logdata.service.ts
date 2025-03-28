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
      this.ropes$.next([...this.ropes]); 
      return;
    }
  
    this.http.get<{ [key: string]: Rope }>(`https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`, {
      params: {
        'auth': this.authToken
      }
    }).subscribe(response => {
      if (response) {
        console.log('Get ropes response: ', response);
  
        
        this.ropes = Object.entries(response).map(([id, rope]) => ({
          id,  
          ...rope
        }));
  
        this.ropes$.next([...this.ropes]); 
      } else {
        this.ropes = [];
        this.ropes$.next([]);
      }
    });
  }

  storeLocation(rope: Rope) {
    this.http
      .post<{ name: string }>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/ropes/${this.userID}.json`,
        rope,
        { params: { 'auth': this.authToken } }
      )
      .subscribe(response => {
        if (response && response.name) {
          const newRope = { ...rope, id: response.name };
          this.ropes.push(newRope);
          this.ropes$.next([...this.ropes]);
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
        this.ropes$.next([...this.ropes]); 
      });
  }

}
