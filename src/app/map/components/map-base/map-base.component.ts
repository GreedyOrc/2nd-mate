import { Component, AfterViewInit, ViewChild, ElementRef} from '@angular/core';


@Component({
  selector: 'app-map-base',
  templateUrl: './map-base.component.html',
  styleUrls: ['./map-base.component.css']
})
export class MapBaseComponent implements AfterViewInit {

  constructor() { }
  
  @ViewChild('mapContainer', {static: false}) mapContainer!: ElementRef;

  map!: google.maps.Map;
  marker!: google.maps.Marker;
  currentPosition?: GeolocationPosition;
  speed: number = 0;
  heading: number = 0;

//  #############~  Uncomment to return to default ~#####################################

  ngAfterViewInit() {
    this.initMap();
    this.initGeolocation();
  }

  private initMap() {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 0, lng: 0 },
      zoom: 15,
      disableDefaultUI: true, // Removes all default controls[5]
      gestureHandling: 'cooperative',
      
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({ map: this.map });
  }

  initGeolocation() {
    console.log("InitGeoLocation");
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => this.updatePosition(position),
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }
  } 

  private updatePosition(position: GeolocationPosition) {
    this.currentPosition = position;
    this.speed = position.coords.speed || 0;
    this.heading = position.coords.heading || 0;

    const pos = new google.maps.LatLng(
      position.coords.latitude,
      position.coords.longitude
    );
    console.log(position);
    this.map.panTo(pos);
    this.marker.setPosition(pos);
    
    // Update marker rotation if heading available
    if (position.coords.heading) {
      this.marker.setIcon({
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        rotation: position.coords.heading,
        scale: 5
      });
    }
  }

  whatsMyPosition(){
      console.log(this.currentPosition);
  }

}
