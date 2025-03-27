// ordering.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';  // Add router
import { VisitDataService } from '../services/visit-data.service';

@Component({
  selector: 'app-ordering',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './ordering.component.html',
  styleUrls: ['./ordering.component.css']
})
export class OrderingComponent implements OnInit {
  visitData: any[] = [];
  filteredVisitData: any[] = [];
  selectedDate: Date | null = new Date();

  constructor(private readonly http: HttpClient,
    private readonly router: Router,  // Add router
    private dataservice: VisitDataService
  ) { }

  ngOnInit(): void {
    this.loadVisitData();
  }

  loadVisitData(): void {
    this.http.get<any[]>('http://localhost:3001/api/form-data')
      .subscribe({
        next: (data) => {
          this.visitData = data;
          this.filterVisitsByDate(this.selectedDate);
          console.log('Ordering data:', data);
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
  onRowClick(row: any): void {
    // Store data in service just like WD
    this.dataservice.currentPatientID = row.patient_id;
    this.dataservice.DOB = row.dob;
    this.dataservice.PtientName = row.first_name + " " + row.last_name;
    this.dataservice.DOS = row.start;
    
    // Navigate to ordering form with data
    this.router.navigate(['/form-order'], { state: { data: row } });
  }
}