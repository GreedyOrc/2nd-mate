import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { BehaviorSubject, forkJoin, map, Observable, Subject } from 'rxjs';
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

  constructor(private http: HttpClient) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.userID = user ? user.uid : null;
      if (this.userID) {
        user?.getIdToken().then((token) => {
          this.authToken = token;
          this.getRopes();
        });
      } else {
        this.getRopes();
      }
    });
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
        // console.log('Get ropes response: ', response);
        this.ropes = response;
        this.ropes$.next(this.ropes.slice());
      }    
    });
  }


  storeLocation(rope: Rope) {
    this.ropes.push(rope);
    this.http.put<Rope>(`https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`,
      this.ropes,{ params: { 'auth': this.authToken } }).subscribe();
    this.ropes$.next(this.ropes.slice()); 
  }

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
      // first place rope into haulled ropes
      this.http.post<Rope>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/haulled-ropes/${this.userID}.json`,
        hauledRope,
        { params: { 'auth': this.authToken } }
      ).subscribe();
      // remove from live ropes
      this.ropes.splice(i, 1);
      this.http.put<Rope[]>(
        `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`,
        this.ropes,
        { params: { 'auth': this.authToken } }
      ).subscribe();


      this.ropes$.next(this.ropes.slice());
      this.ropeUpdated$.next();
      
    }
  }

  getAllRopes(): Observable<Rope[]> {
    let liveropes = this.http.get<{ [key: string]: Rope }>(
      `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/live-ropes/${this.userID}.json`
      ,
      {params: {'auth': this.authToken}}).pipe(
      map((response) => response ? Object.values(response) : [])
      
    );
    let hauledropes = this.http.get<{ [key: string]: Rope }>(
      `https://nd-mate-1ad17-default-rtdb.europe-west1.firebasedatabase.app/haulled-ropes/${this.userID}.json`
      ,
      {params: {'auth': this.authToken}}).pipe(
      map((response) => response ? Object.values(response) : [])
      
    );

    return forkJoin([liveropes, hauledropes]).pipe(
      map(([liveropes, hauledropes]) => [...liveropes, ...hauledropes]))
    
  }

  
  
}
