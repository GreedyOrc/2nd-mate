import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  getCurrentLocation(): Promise<{ latitude: number, longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        }, (error) => {
          reject(error);
        });
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }
}
