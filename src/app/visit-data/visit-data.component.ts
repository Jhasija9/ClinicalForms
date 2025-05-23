import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';  // Add this import
import { VisitData } from '../models/visit-data';
import { VisitDataService } from '../services/visit-data.service';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-visit-data-table',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule  // Just import HttpClientModule directly
  ],
  templateUrl: './visit-data.component.html',
  styleUrls: ['./visit-data.component.css']
})
export class VisitDataComponent implements OnInit {
  visitData: VisitData[] = [];
  filteredVisitData: VisitData[] = [];
  selectedDate: Date | null = new Date();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private dataservice: VisitDataService  
  ) { }
  ngOnInit(): void {
    this.loadVisitData();
  }

  loadVisitData(): void {
    this.http.get<VisitData[]>('http://localhost:3001/api/form-data')
      .subscribe({
        next: (data) => {
          this.visitData = data;
          this.filterVisitsByDate(this.selectedDate)
          console.log('data :>> ', data);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  filterVisitsByDate(date: Date | null): void {
    if (!date) {
      this.filteredVisitData = this.visitData;
      return;
    }

    const dateStr = date.toISOString().split('T')[0];
    this.filteredVisitData = this.visitData.filter(visit => {
      const visitDate = new Date(visit.start).toISOString().split('T')[0];
      return visitDate === dateStr;
    });
  }

  onDateSelected(event: any): void {
    this.selectedDate = event.value;
    this.filterVisitsByDate(this.selectedDate);
  }
  
  clearDateFilter(): void {
    this.selectedDate = null;
    this.filteredVisitData = this.visitData;
  }

  onWDClick(row: VisitData): void {
    // console.log('WD clicked:', row);
    this.dataservice.currentPatientID = row.patient_id
    this.dataservice.DOB = row.dob
    this.dataservice.PtientName = row.first_name + " " + row.last_name
    this.dataservice.DOS = row.start
console.log('row.start :>> ', row.start);
    this.router.navigate(['/written-directive'], { state: { data: row } });

  }

  onVolCalcClick(row: VisitData): void {
    console.log('Vol Calc clicked:', row);
    this.dataservice.currentPatientID = row.patient_id
    this.dataservice.DOB = row.dob
    this.dataservice.PtientName = row.first_name + " " + row.last_name
    this.dataservice.DOS = row.start
console.log('row.start :>> ', row.start);
    this.router.navigate(['/volume-calculation'], { state: { data: row } });
  }

  onSMITClick(row: VisitData): void {
    this.dataservice.currentPatientID = row.patient_id
    this.dataservice.DOB = row.dob
    this.dataservice.PtientName = row.first_name + " " + row.last_name
    this.dataservice.DOS = row.start
console.log('row.start :>> ', row.start);
    this.router.navigate(['/smith'], { state: { data: row } })
  }
  onSLipClick(row: VisitData): void {
    // console.log('SMIT clicked:', row);
    this.router.navigate(['/syringe'], { state: { data: row } })
  }
}