// attest-data.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitDataService, VialData } from '../services/visit-data.service';
import { Router } from '@angular/router';

// interface VialData {
//   rx_number: string;
//   Radiopharmaceutical: string;
// }

@Component({
  selector: 'app-attest-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attest-data.component.html',
  styleUrls: ['./attest-data.component.css']
})
export class AttestDataComponent implements OnInit {
  vialData: VialData[] = [];

  constructor(private visitDataService: VisitDataService,
    private router: Router
  ) {}

  onRxClick(rx: string) {
    console.log('Clicked Rx:', rx);
    const selectedData = this.vialData.find(item => item.rx_number === rx);
    
    if (selectedData) {
      console.log('Selected data:', selectedData);
      this.visitDataService.setSelectedRxData(selectedData);
      this.router.navigate(['/large-label']);
    }
  }
  ngOnInit() {
    this.loadVialData();
  }


  loadVialData() {
    this.visitDataService.getVialData().subscribe({
      next: (data: VialData[]) => {
        console.log('Vial Data received:', data);
        this.vialData = data;
      },
      error: (error) => {
        console.error('Error fetching vial data:', error);
      }
    });
  }
  
}