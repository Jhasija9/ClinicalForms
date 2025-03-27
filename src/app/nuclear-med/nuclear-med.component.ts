// nuclear-med.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-nuclear-med',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './nuclear-med.component.html',
  styleUrls: ['./nuclear-med.component.css']
})
export class NuclearMedComponent implements OnInit {
  orders: any[] = [];
  selectedRows: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.http.get<any[]>('http://localhost:3001/api/nuclear-med-orders')
      .subscribe({
        next: (data) => {
          this.orders = data;
          this.selectedRows = [];
        },
        error: (error) => console.error('Error loading orders:', error)
      });
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedRows = [...this.orders];
    } else {
      this.selectedRows = [];
    }
  }

  onRowSelect(row: any, event: any) {
    if (event.target.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(r => r.patient_id !== row.patient_id);
    }
  }

  isSelected(row: any): boolean {
    return this.selectedRows.some(r => r.patient_id === row.patient_id);
  }

  onOrderSent() {
    if (this.selectedRows.length === 0) return;

    const patientIds = this.selectedRows.map(row => row.patient_id);

    this.http.post('http://localhost:3001/api/update-orders-sent', { patientIds })
      .subscribe({
        next: () => {
          alert('Orders marked as sent successfully');
          this.loadOrders();
        },
        error: (err) => {
          console.error('Error updating orders:', err);
          alert('Error updating orders');
        }
      });
  }
}