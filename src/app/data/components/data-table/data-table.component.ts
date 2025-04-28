import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Rope } from 'src/app/map/models/ropes.model';
import { LogdataService } from 'src/app/map/services/logdata.service';


@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'], 

})
export class DataTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['dropTime', 'catchtype', 'depth', 'startlocation', 'endlocation', 'rating']; // Define your table columns
  dataSource = new MatTableDataSource<Rope>(); 

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private logdataService: LogdataService) {}

  ngAfterViewInit() {
    this.logdataService.getAllRopes().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}