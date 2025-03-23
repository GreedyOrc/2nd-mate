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
  catchTypes: { name: string; colour: string }[] = [];
  selectedCatchType: string = '';

  ropesPolylines: google.maps.Polyline[] = []; // Store polyline references

  //  #############~  Uncomment to return to default ~#####################################

  //Attempt at drop down menu
  ngOnInit() {

    this.logdataService.getCatchTypes();
    this.logdataService.catchtypes$.subscribe((types) => {
      this.catchTypes = types || [];
    });

  }



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
      gestureHandling: 'greedy',
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      fullscreenControl: true
    };


    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({ map: this.map });

    // Create the DIV to hold the control.
    const centerControlDiv = document.createElement('div');
    const infoBannerDiv = document.createElement('div1');
    const dropDownDiv = document.createElement('div2');

    // Create the control.
    const centerControl = this.createCenterControl(this.map);
    const infoControl = this.createInfoBanner();
    const createRopeControl = this.createRopeControls();
    const catchtTypeDropDown = this.createCatchTypeDropDown();

    // Append the control to the DIV.
    centerControlDiv.appendChild(centerControl);
    infoBannerDiv.appendChild(infoControl);
    infoBannerDiv.appendChild(createRopeControl);
    dropDownDiv.appendChild(catchtTypeDropDown);
    //Push to map
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoControl);
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(createRopeControl);
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(catchtTypeDropDown);
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
          strokeColor: '#000000', // Black polyline
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map: this.map,
        });

        // Create an icon marker at the rope's end location
        const iconMarker = new google.maps.Marker({
          position: ropePath[1], // Set position to the end of the rope
          map: this.map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE, // Small circle
            scale: 6,
            fillColor: rope.colour, // Bright orange-red
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        // Create an InfoWindow for the marker
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
              <h3 style="margin: 0; font-size: 16px; color: #d9534f;">Rope Details</h3>
              <p><strong>Created:</strong> ${new Date(rope.time).toLocaleString()}</p>
              <p><strong>Catch Type:</strong> 
                <span >${rope.catchtype}</span>
              </p>
              <p><strong>Start:</strong> 
                <span >(${rope.startLocation.coords.latitude.toFixed(5)}, ${rope.startLocation.coords.longitude.toFixed(5)})</span>
              </p>
              <p><strong>End:</strong> 
                <span >(${rope.endLocation.coords.latitude.toFixed(5)}, ${rope.endLocation.coords.longitude.toFixed(5)})</span>
              </p>
            </div>
          `,
        });

        // Add click event listener to the marker instead of the polyline
        iconMarker.addListener("click", () => {
          infoWindow.open(this.map, iconMarker);
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
    if (speedCell) speedCell.innerHTML = this.speed.toFixed(2) + ' m/s';
    if (directionCell) directionCell.innerHTML = this.heading.toFixed(2) + '°';
    if (latCell) latCell.innerHTML = position.coords.latitude.toString();
    if (longCell) longCell.innerHTML = position.coords.longitude.toString();

  }

  createCenterControl(map: google.maps.Map) {
    // Create the control div
    const controlButtonDiv = document.createElement('div');

    // Create an icon element with a button-like container
    const centerControlButton = document.createElement('div');
    centerControlButton.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        margin-right: 10px; /* Align with zoom controls */
        margin-bottom: 5px; /* Adjust spacing above zoom buttons */
        
      ">
        <i class="fa fa-crosshairs" style="font-size: 18px; color: #5f6368;"></i>
      </div>
    `;

    // Click event to re-center the map
    centerControlButton.addEventListener('click', () => {
      if (this.currentPosition?.coords) {
        map.setCenter({
          lat: this.currentPosition.coords.latitude,
          lng: this.currentPosition.coords.longitude
        });
      } else {
        console.warn("Current position is not available");
      }
    });

    // Append the button to the control div
    controlButtonDiv.appendChild(centerControlButton);

    // Position it directly above the zoom control
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlButtonDiv);

    return controlButtonDiv;
  }

  // createStartRope(map: google.maps.Map) {
  //   const startRope = document.createElement('button');
  //   this.customButtonSetup(startRope);

  //   startRope.textContent = 'Start Rope';
  //   startRope.title = 'Click to start the rope';
  //   startRope.type = 'button';
  //   startRope.id = 'startRopeButton';

  //   startRope.addEventListener('click', () => {
  //     // this.whatsMyPosition();
  //     this.startRope(startRope);
  //   });
  //   return startRope;

  // }

  // createEndRope(map: google.maps.Map) {
  //   const endRope = document.createElement('button');
  //   this.customButtonSetup(endRope);

  //   endRope.textContent = 'End Rope';
  //   endRope.title = 'Click to end the rope';
  //   endRope.type = 'button';
  //   endRope.id = 'endRopeButton';
  //   endRope.style.display = 'none';

  //   endRope.addEventListener('click', () => {
  //     this.endRope(endRope);
  //   });
  //   return endRope;

  // }

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


  createRopeControls() {
    const ropeControlDiv = document.createElement('div');
    ropeControlDiv.style.position = 'relative'; // Ensure the buttons stay in the same space
    ropeControlDiv.style.width = '120px';
    ropeControlDiv.style.height = '40px';
    ropeControlDiv.style.marginBottom = '30px';

    const startRope = document.createElement('button');
    const endRope = document.createElement('button');

    this.customButtonSetup(startRope);
    this.customButtonSetup(endRope);

    startRope.textContent = 'Start Rope';
    startRope.title = 'Click to start the rope';
    startRope.id = 'startRopeButton';
    startRope.style.position = 'absolute';
    startRope.style.width = '100%';
    startRope.style.height = '100%';


    endRope.textContent = 'End Rope';
    endRope.title = 'Click to end the rope';
    endRope.id = 'endRopeButton';
    endRope.style.position = 'absolute';
    endRope.style.width = '100%';
    endRope.style.height = '100%';
    endRope.style.display = 'none'; // Initially hidden

    startRope.addEventListener('click', () => this.startRope(startRope, endRope));
    endRope.addEventListener('click', () => this.endRope(startRope, endRope));

    ropeControlDiv.appendChild(startRope);
    ropeControlDiv.appendChild(endRope);

    return ropeControlDiv;
  }

  createCatchTypeDropDown() {
    const dropdownDiv = document.createElement('div');
    dropdownDiv.style.backgroundColor = 'white';
    dropdownDiv.style.border = '2px solid #fff';
    dropdownDiv.style.borderRadius = '4px';
    dropdownDiv.style.padding = '5px';
    dropdownDiv.style.margin = '10px';
    dropdownDiv.style.boxShadow = '0px 1px 4px rgba(0,0,0,0.3)';

    const select = document.createElement('select');
    select.style.width = '150px';
    select.style.padding = '5px';

    // Function to populate dropdown options
    const updateDropdown = () => {
      select.innerHTML = ''; // Clear existing options
      this.catchTypes.forEach((type) => {
        // console.log('inside updatedropdown ')
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        select.appendChild(option);
      });
    };

    // Initial population (if data is already available)
    updateDropdown();

    // Listen for data updates (wait for Firebase data)
    this.logdataService.getCatchTypes().subscribe((types) => {
      this.catchTypes = types;
      updateDropdown(); // Update the dropdown options dynamically
    });

   

    select.addEventListener('change', (event) => {
      this.selectedCatchType = (event.target as HTMLSelectElement).value;
      console.log('Selected Catch Type:', this.selectedCatchType);
    });

    dropdownDiv.appendChild(select);
    return dropdownDiv;
  }




  startRope(startRope: HTMLButtonElement, endRope: HTMLButtonElement) {
    console.log('Start Rope Button Pressed!');
    this.startPosition = this.currentPosition;
    console.log('Start Position Stored!', this.currentPosition);

    startRope.style.display = 'none'; // Hide start button
    endRope.style.display = 'block'; // Show end button
  }

  endRope(startRope: HTMLButtonElement, endRope: HTMLButtonElement) {
    console.log('End Rope Button Pressed!');
    console.log(this.selectedCatchType);
    const colour = this.getColourForCatchType(this.selectedCatchType);
    this.logdataService.storeLocation(this.startPosition!, this.currentPosition!, this.selectedCatchType, colour );

    endRope.style.display = 'none'; // Hide end button
    startRope.style.display = 'block'; // Show start button again
  }

  getColourForCatchType(catchTypeName: string): string {
    const catchType = this.catchTypes.find(ct => ct.name === catchTypeName);
    return catchType ? catchType.colour : '#000000'; // Return undefined if not found
  }

}
