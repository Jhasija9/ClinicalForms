import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';  // Add this import
import { VisitData } from '../models/visit-data';

@Component({
  selector: 'app-visit-data-table',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule  // Just import HttpClientModule directly
  ],
  templateUrl: './visit-data.component.html',
  styleUrls: ['./visit-data.component.css']
})
export class VisitDataComponent implements OnInit {
  visitData: VisitData[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router  // Add readonly
  ) { }
  ngOnInit(): void {
    this.loadVisitData();
  }

  loadVisitData(): void {
    this.http.get<VisitData[]>('http://localhost:3001/api/form-data')
      .subscribe({
        next: (data) => {
          this.visitData = data;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }

  onWDClick(row: VisitData): void {
    // console.log('WD clicked:', row);
    this.router.navigate(['/written-directive'], { state: { data: row } });

  }

  onVolCalcClick(row: VisitData): void {
    console.log('Vol Calc clicked:', row);
    this.router.navigate(['/volume-calculation'], { state: { data: row } });
  }

  onSMITClick(row: VisitData): void {
    // console.log('SMIT clicked:', row);
    this.router.navigate(['/smith'], { state: { data: row } })
  }
}