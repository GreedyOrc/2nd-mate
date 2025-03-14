import { Component, OnInit } from '@angular/core';
import { GeolocationService } from '../../services/geolocation.service';

@Component({
  selector: 'app-google-layer',
  templateUrl: './google-layer.component.html',
  styleUrls: ['./google-layer.component.css']
})
export class GoogleLayerComponent implements OnInit {

  


  location: { latitude: number, longitude: number } | null = null;

  constructor(private geolocationService: GeolocationService) { }

  center: google.maps.LatLngLiteral = { lat: 59.0184448, lng: -3.1326208 }; // Example coordinates for Tokyo
  zoom = 16;
  height = "90vh";
  width = "100%";

  ngOnInit(): void { 
    this.geolocationService.getCurrentLocation()
    .then(location => this.location = location)
    .catch(error => console.error('Error getting location:', error));

  }

}
