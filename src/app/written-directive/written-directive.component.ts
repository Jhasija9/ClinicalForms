import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';  // Add this if not already imported
// import { importProvidersFrom } from '@angular/core';  // Add this import
import { HttpClient, HttpClientModule } from '@angular/common/http';  // Add HttpClientModule





@Component({
  selector: 'app-written-directive',
  standalone: true,
  imports: [ReactiveFormsModule,  CommonModule, HttpClientModule  ],
  templateUrl: './written-directive.component.html',
  styleUrls: ['./written-directive.component.css'],
  
})
export class WrittenDirectiveComponent implements OnInit {
  wdForm: FormGroup;

  constructor(private http: HttpClient) {
    this.wdForm = new FormGroup({
      // Patient Identification
      patientName: new FormControl(''),
      subjectId: new FormControl(''),
      dob: new FormControl(''),
      screeningWeight: new FormControl(''),
      // patientName: new FormControl(''),
      // subjectId: new FormControl(''),
      // dob: new FormControl(''),
      protocol: new FormControl(''),
      arm1: new FormControl(false),
      arm2: new FormControl(false),
      arm3: new FormControl(false),
      // screeningWeight: new FormControl(''),
      assignedDose: new FormControl(''),

      // Dose Ordering
      prescribedDosage: new FormControl(''),
      prescribedDosageUci: new FormControl(''),
      adminDate: new FormControl(''),
      adminTime: new FormControl(''),
      authUserSignature: new FormControl(''),
      signatureDate: new FormControl(''),
      signatureTime: new FormControl(''),

      // IMP Receipt & Inventory
      manufacturer: new FormControl(''),
      containerId: new FormControl(''),
      lotBatch: new FormControl(''),
      volume: new FormControl(''),

      // Dose Dispensing
      syringeId: new FormControl(''),
      syringeVolume: new FormControl(''),

      // Dose Administration
      informedConsent: new FormControl(false),
      safetyChecklist: new FormControl(false),
      timeOut: new FormControl(false),
      rightPICC: new FormControl(false),
      leftPICC: new FormControl(false),
      chemoPort: new FormControl(false),
      other: new FormControl(false),
      otherLocation: new FormControl(''),
      startDate: new FormControl(''),
      startTime: new FormControl(''),
      endTime: new FormControl('')
    });
  }

  // ngOnInit() {
  //   this.http.get<any>('http://localhost:3001/api/form-data').subscribe({
  //     next: (data) => {
  //       if (data) {
  //         console.log('API Response:', data);
  //         this.wdForm.patchValue({
  //           patientName: data.first_name && data.last_name ? 
  //             `${data.first_name} ${data.last_name}` : '',
  //           subjectId: data.patient_id || '',
  //           dob: data.dob ? data.dob.split(' ')[0] : '',
  //           screeningWeight: data.screening_weight || ''
  //         });
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching data:', error);
  //       // Handle error - maybe show a user message
  //     }
  //   });
  // }
  ngOnInit() {
    this.http.get<any>('http://localhost:3001/api/form-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response[0];  // Get the first item from the array
          console.log('First record:', data);
          
          this.wdForm.patchValue({
            patientName: data.first_name && data.last_name ? 
              `${data.first_name} ${data.last_name}` : '',
            subjectId: data.patient_id || '',
            dob: data.dob ? data.dob.split('T')[0] : '',  // Changed split(' ') to split('T')
            screeningWeight: data.screening_weight || ''
          });
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }
  

  generatePDF() {
    const data = document.getElementById('wdForm');
    if (data) {
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode, A4 size
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
  
      html2canvas(data, {
        scale: 2, // Improves image quality
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
        let heightLeft = imgHeight;
        let position = 0;
  
        // First page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, Math.min(imgHeight, pdfHeight));
        heightLeft -= pdfHeight;
        position = pdfHeight;
  
        // If content overflows, add new pages
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          position += pdfHeight;
        }
  
        pdf.save('WrittenDirective.pdf');
      });
    }
  }
  
}  