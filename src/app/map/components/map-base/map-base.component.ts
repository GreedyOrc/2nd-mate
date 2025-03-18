import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LogdataService } from '../../services/logdata.service';


@Component({
  selector: 'app-map-base',
  templateUrl: './map-base.component.html',
  styleUrls: ['./map-base.component.css']
})
export class MapBaseComponent implements AfterViewInit {

  constructor(private logdataService: LogdataService) { }

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  startPosition?: GeolocationPosition;
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  currentPosition?: GeolocationPosition;
  speed: number = 0;
  heading: number = 0;
  house = { lat: 59.015168, lng: -3.1424512 };

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
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.LEFT_CENTER },
    };


    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({ map: this.map });

    // Create the DIV to hold the control.
    const centerControlDiv = document.createElement('div');
    const infoBannerDiv = document.createElement('div1');

    // Create the control.
    const centerControl = this.createCenterControl(this.map);
    const startRopeControl = this.createStartRope(this.map);
    const endRopeControl = this.createEndRope(this.map);
    const infoControl = this.createInfoBanner();

    // Append the control to the DIV.
    centerControlDiv.appendChild(centerControl);
    centerControlDiv.appendChild(startRopeControl);
    centerControlDiv.appendChild(endRopeControl);
    infoBannerDiv.appendChild(infoControl);

    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(startRopeControl);
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(endRopeControl);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoControl);
  }

  initGeolocation() {
    // console.log("InitGeoLocation");
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
    // console.log(position);
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

    // Update table cells
    // error happens when first loading - then ok's out. Maybe need to catch the erorr however it is updating. 
  document.getElementById('speedCell')!.innerHTML = this.speed + ' m/s';
  document.getElementById('directionCell')!.innerHTML = this.heading + '°';
  document.getElementById('latCell')!.innerHTML = position.coords.latitude.toString();
  document.getElementById('longCell')!.innerHTML = position.coords.longitude.toString();

  }

  createCenterControl(map: google.maps.Map ) {
    //need to place this into CSS file
    const controlButton = document.createElement('button');
    this.customButtonSetup(controlButton);

    controlButton.textContent = 'Center Map';
    controlButton.title = 'Click to recenter the map';
    controlButton.type = 'button';
    //need to think about how to restructre this. 
    controlButton.addEventListener('click', () => {
      map.setCenter(this.house);
      this.whatsMyPosition();
      
    });
    return controlButton;
  }

  createStartRope(map: google.maps.Map ) {
    const startRope = document.createElement('button');
    this.customButtonSetup(startRope);

    startRope.textContent = 'Start Rope';
    startRope.title = 'Click to start the rope';
    startRope.type = 'button';
    startRope.id = 'startRopeButton';

    startRope.addEventListener('click', () => {
      // this.whatsMyPosition();
      this.startRope(startRope);
    });
    return startRope;

  }

  createEndRope(map: google.maps.Map ) {
    const endRope = document.createElement('button');
    this.customButtonSetup(endRope);

    endRope.textContent = 'End Rope';
    endRope.title = 'Click to end the rope';
    endRope.type = 'button';
    endRope.id = 'endRopeButton';
    endRope.style.display = 'none';

    endRope.addEventListener('click', () => {
      this.whatsMyPosition();
      this.endRope(endRope);
    });
    return endRope;

  }

  createInfoBanner(){
    const infoSpeedTable = document.createElement('table');
    let newrow1 = infoSpeedTable.insertRow(0);
    newrow1.insertCell(0).innerHTML = 'Speed' ;
    newrow1.insertCell(1).innerHTML = + this.speed + ' m/s';
    newrow1.cells[1].id = 'speedCell';
    
    let newrow2 = infoSpeedTable.insertRow(1);
    newrow2.insertCell(0).innerHTML = 'Direction' ;
    newrow2.insertCell(1).innerHTML = + this.heading + '°';
    newrow2.cells[1].id = 'directionCell';

    let newrow3 = infoSpeedTable.insertRow(2);
    newrow3.insertCell(0).innerHTML = 'Lat' ;
    newrow3.insertCell(1).innerHTML =  'N/A';
    newrow3.cells[1].id = 'latCell';

    let newrow4 = infoSpeedTable.insertRow(3);
    newrow4.insertCell(0).innerHTML = 'Long' ;
    newrow4.insertCell(1).innerHTML = 'N/A';
    newrow4.cells[1].id = 'longCell';

    infoSpeedTable.style.backgroundColor = '#fff';
    infoSpeedTable.style.border = '2px solid #fff';
    infoSpeedTable.style.borderRadius = '3px';
    infoSpeedTable.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';

    return infoSpeedTable;

  }
  
  customButtonSetup(button: HTMLButtonElement) {
    button.style.backgroundColor = '#fff';
    button.style.border = '2px solid #fff';
    button.style.borderRadius = '3px';
    button.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    button.style.color = 'rgb(25,25,25)';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Roboto,Arial,sans-serif';
    button.style.fontSize = '16px';
    button.style.lineHeight = '38px';
    button.style.margin = '8px 0 22px';
    button.style.padding = '0 10px';
    button.style.textAlign = 'center';
  }
  //also need to think if we can show heading etc info on the map. 

  startRope(startRope: HTMLButtonElement){
    console.log('Start Rope Button Pressed!')
    //can we add a pin? Should we display test for start of rope and end? 
    startRope.style.display = 'none';
    document.getElementById('endRopeButton')!.style.display = 'block';
    this.startPosition = this.currentPosition;
    console.log('Start Position Stored!')
    console.log(this.currentPosition);
  }

  endRope(endRope: HTMLButtonElement){
    console.log('End Rope Button Pressed!')
    endRope.style.display = 'none';
    document.getElementById('startRopeButton')!.style.display = 'block';
    console.log('start position' + this.startPosition);
    console.log(this.startPosition);
    console.log('current position' + this.currentPosition);
    console.log( this.currentPosition);
    this.logdataService.storeLocation(this.startPosition!, this.currentPosition!);
    //can we add a pin? Should we display test for start of rope and end? 
    // startRope.style.display = 'none';
  }

  whatsMyPosition() {
    console.log(this.currentPosition);
  }

  onAddRope(currentPosition: GeolocationPosition) {
    // this.logdataService.storeLocation( this.startPosition, currentPosition);
  }

}
