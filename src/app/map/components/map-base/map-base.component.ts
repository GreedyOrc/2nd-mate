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

  ropesPolylines: google.maps.Polyline[] = []; // Store polyline references

  //  #############~  Uncomment to return to default ~#####################################

  ngAfterViewInit() {
    this.initMap();
    this.initGeolocation();

    this.logdataService.ropes$.subscribe(ropes => {
      this.drawRopesOnMap(ropes);
    });
  }

  private initMap() {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 0, lng: 0 },
      zoom: 15,
      disableDefaultUI: true, // Removes all default controls[5]
      gestureHandling: 'cooperative',
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
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
      //Update position on first load
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("First position obtained:", position);
          this.updatePosition(position);
          if (position) {
            // console.log('Inside position check')
            this.map.setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
          //then watch position and set loop. 
          navigator.geolocation.watchPosition(
            (pos) => this.updatePosition(pos),
            (error) => console.error('Geolocation error:', error),
            { enableHighAccuracy: true }
          );
        },
        (error) => console.error('Error getting initial position:', error),
        { enableHighAccuracy: true }
      );
    }
  }


  private drawRopesOnMap(ropes: any[]) {
    // Clear existing polylines
    this.ropesPolylines.forEach(polyline => polyline.setMap(null));
    this.ropesPolylines = [];
  
    ropes.forEach(rope => {
      if (rope.startLocation && rope.endLocation) {
        const ropePath = [
          { lat: rope.startLocation.coords.latitude, lng: rope.startLocation.coords.longitude },
          { lat: rope.endLocation.coords.latitude, lng: rope.endLocation.coords.longitude }
        ];
  
        const polyline = new google.maps.Polyline({
          path: ropePath,
          geodesic: true,
          strokeColor: '#000000', // Brighter Orange-Red
          strokeOpacity: 0.9, // Slightly transparent
          strokeWeight: 5, // Increased thickness
          map: this.map,
          icons: [{
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, // Adds small arrows along the line
              scale: 4,
              strokeColor: "#FF4500", // White arrows for contrast
            },
            offset: "50%", // Position at the middle of the polyline
          }]
        });
  
        // Create an InfoWindow
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="
              font-family: Arial, sans-serif;
              font-size: 14px;
              color: #333;
              padding: 10px;
              max-width: 250px;
              word-wrap: break-word;
              border-radius: 8px;
            ">
              <h3 style="margin: 0; font-size: 16px; color: #d9534f;">📌 Rope Details</h3>
              <p><strong>Created:</strong> ${new Date(rope.time).toLocaleString()}</p>
              <p><strong>Start:</strong> 
                <span style="color: #5bc0de;">(${rope.startLocation.coords.latitude.toFixed(5)}, ${rope.startLocation.coords.longitude.toFixed(5)})</span>
              </p>
              <p><strong>End:</strong> 
                <span style="color: #5bc0de;">(${rope.endLocation.coords.latitude.toFixed(5)}, ${rope.endLocation.coords.longitude.toFixed(5)})</span>
              </p>
              <button style="
                background-color: #5cb85c;
                color: white;
                border: none;
                padding: 8px 12px;
                margin-top: 5px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                width: 100%;
                text-align: center;

            </div>
          `,
        });
  
        // Add Click Event Listener to Polyline
        polyline.addListener("click", () => {
          infoWindow.setPosition(ropePath[1]); // Show the info at the end location
          infoWindow.open(this.map);
        });
  
        this.ropesPolylines.push(polyline);
      }
    });
  }

  private updatePosition(position: GeolocationPosition) {
    this.currentPosition = position;
    this.speed = position.coords.speed || 0;
    this.heading = position.coords.heading || 0;

    const pos = new google.maps.LatLng(
      position.coords.latitude,
      position.coords.longitude
    );

    this.marker.setPosition(pos);

    const speedCell = document.getElementById('speedCell');
    const directionCell = document.getElementById('directionCell');
    const latCell = document.getElementById('latCell');
    const longCell = document.getElementById('longCell');

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
    if (speedCell) speedCell.innerHTML = this.speed + ' m/s';
    if (directionCell) directionCell.innerHTML = this.heading + '°';
    if (latCell) latCell.innerHTML = position.coords.latitude.toString();
    if (longCell) longCell.innerHTML = position.coords.longitude.toString();

  }

  createCenterControl(map: google.maps.Map) {
    //need to place this into CSS file
    const controlButton = document.createElement('button');
    this.customButtonSetup(controlButton);

    controlButton.textContent = 'Center Map';
    controlButton.title = 'Click to recenter the map';
    controlButton.type = 'button';
    //need to think about how to restructre this. 
    controlButton.addEventListener('click', () => {

      if (this.currentPosition?.coords) {
        map.setCenter({
          lat: this.currentPosition.coords.latitude,
          lng: this.currentPosition.coords.longitude
        });
        this.whatsMyPosition();
      } else {
        console.warn("Current position is not available");
      }
    });
    return controlButton;
  }

  createStartRope(map: google.maps.Map) {
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

  createEndRope(map: google.maps.Map) {
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

  createInfoBanner() {
    const infoSpeedTable = document.createElement('table');
    let newrow1 = infoSpeedTable.insertRow(0);
    newrow1.insertCell(0).innerHTML = 'Speed';
    newrow1.insertCell(1).innerHTML = + this.speed + ' m/s';
    newrow1.cells[1].id = 'speedCell';

    let newrow2 = infoSpeedTable.insertRow(1);
    newrow2.insertCell(0).innerHTML = 'Direction';
    newrow2.insertCell(1).innerHTML = + this.heading + '°';
    newrow2.cells[1].id = 'directionCell';

    let newrow3 = infoSpeedTable.insertRow(2);
    newrow3.insertCell(0).innerHTML = 'Lat';
    newrow3.insertCell(1).innerHTML = 'N/A';
    newrow3.cells[1].id = 'latCell';

    let newrow4 = infoSpeedTable.insertRow(3);
    newrow4.insertCell(0).innerHTML = 'Long';
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

  startRope(startRope: HTMLButtonElement) {
    console.log('Start Rope Button Pressed!')
    //can we add a pin? Should we display test for start of rope and end? 
    startRope.style.display = 'none';
    document.getElementById('endRopeButton')!.style.display = 'block';
    this.startPosition = this.currentPosition;
    console.log('Start Position Stored!')
    console.log(this.currentPosition);
  }

  endRope(endRope: HTMLButtonElement) {
    console.log('End Rope Button Pressed!')
    endRope.style.display = 'none';
    document.getElementById('startRopeButton')!.style.display = 'block';
    console.log('start position' + this.startPosition);
    console.log(this.startPosition);
    console.log('current position' + this.currentPosition);
    console.log(this.currentPosition);
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
