import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  
   constructor(private http: HttpClient) {}

   async getDept(startPos: GeolocationPosition, endPos: GeolocationPosition) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json'
      },
      params: {
        latitude: `${startPos.coords.latitude},${endPos.coords.latitude}`,
        longitude: `${startPos.coords.longitude},${endPos.coords.longitude}`
      }
    };

    console.log('Get Depth Position Info' , startPos.coords.latitude,", ", endPos.coords.longitude);
    const response:  { elevation: number[] } = await firstValueFrom( this.http.get<{elevation: number[]}>('https://api.open-meteo.com/v1/elevation', options));
    const startElevation = response.elevation[0];
    const endElevation = response.elevation[1];
    const averagedepth = (response.elevation[0]+response.elevation[1])/2
    return averagedepth

    // await this.http.get<[]>('https://api.open-meteo.com/v1/elevation', options).subscribe(response => {


    //   console.log('Inside get depth', response);
    //   return response
    // }) 

  }

  // ############### First Attempt #####################

  // getCurrentLocation(): Promise<{ latitude: number, longitude: number }> {
  //   return new Promise((resolve, reject) => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition((position) => {
  //         const { latitude, longitude } = position.coords;
  //         resolve({ latitude, longitude });
  //       }, (error) => {
  //         reject(error);
  //       });
  //     } else {
  //       reject(new Error('Geolocation is not supported by this browser.'));
  //     }
  //   });
  // }



}
