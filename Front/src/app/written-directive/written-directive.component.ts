import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-written-directive',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './written-directive.component.html',
  styleUrls: ['./written-directive.component.css'],
})
export class WrittenDirectiveComponent implements OnInit {
  wdForm: FormGroup;

  constructor(private http: HttpClient) {
    this.wdForm = new FormGroup({
      patientName: new FormControl(''),
      subjectId: new FormControl(''),
      dob: new FormControl(''),
      screeningWeight: new FormControl(''),
      protocol: new FormControl(''),
      arm1: new FormControl(false),
      arm2: new FormControl(false),
      arm3: new FormControl(false),
      assignedDose: new FormControl(''),
      prescribedDosage: new FormControl(''),
      prescribedDosageUci: new FormControl(''),
      adminDate: new FormControl(''),
      adminTime: new FormControl(''),
      authUserSignature: new FormControl(''),
      signatureDate: new FormControl(''),
      signatureTime: new FormControl(''),
      manufacturer: new FormControl(''),
      containerId: new FormControl(''),
      lotBatch: new FormControl(''),
      volume: new FormControl(''),
      syringeId: new FormControl(''),
      syringeVolume: new FormControl(''),
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
      endTime: new FormControl(''),
      treatment_no: new FormControl(''),

    });
  }

  ngOnInit() {
    this.http.get<any>('http://localhost:3001/api/form-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response[0];
          this.wdForm.patchValue({
            patientName: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : '',
            subjectId: data.patient_id || '',
            dob: data.dob ? data.dob.split('T')[0] : '',
            screeningWeight: data.screening_weight || '',
          });
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  generatePDF() {
    const header = document.querySelector('.header'); // Capture header separately
    const formContent = document.querySelector('form'); // Capture form content separately
    const inputs = document.querySelectorAll('input');
  // Remove borders temporarily
  inputs.forEach(input => {
    input.style.border = 'none';
    input.style.outline = 'none';
    input.style.background = 'transparent';
  });
    if (header && formContent) {
      // Convert header to canvas
      html2canvas(header as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      }).then(headerCanvas => {
        // Convert form content to canvas
        html2canvas(formContent as HTMLElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        }).then(formCanvas => {
          const pdf = new jsPDF('p', 'mm', 'a4');
  
                // Restore borders after capturing
      inputs.forEach(input => {
        input.style.border = '';
        input.style.outline = '';
        input.style.background = '';
      });

          // Define margins
          const headerMargin = 5.08; // 0.2 inches = 5.08 mm
          const formMargin = 25.4/2; // 1 inch = 25.4 mm
  
          const pdfWidth = 210 - 2 * formMargin; // A4 width minus left & right margins
          const headerHeight = (headerCanvas.height * (210 - 2 * headerMargin)) / headerCanvas.width;
          const formHeight = (formCanvas.height * pdfWidth) / formCanvas.width;
  
          let heightLeft = formHeight;
          let position = headerMargin; // Start position after the small header margin
  
          // Add the header
          pdf.addImage(headerCanvas.toDataURL('image/png'), 'PNG', headerMargin, position, 210 - 2 * headerMargin, headerHeight);
          position += headerHeight + formMargin - headerMargin; // Adjust position for form after 1-inch margin
  
          // Add the first page of the form content
          pdf.addImage(formCanvas.toDataURL('image/png'), 'PNG', formMargin, position, pdfWidth, Math.min(formHeight, 297 - position - formMargin));
          heightLeft -= (297 - position - formMargin);
          position = 297 - formMargin;
  
          // If content overflows, add new pages with 1-inch margin
          while (heightLeft > 0) {
            pdf.addPage();
            pdf.addImage(formCanvas.toDataURL('image/png'), 'PNG', formMargin, -position + formMargin, pdfWidth, formHeight);
            heightLeft -= (297 - 2 * formMargin);
            position += (297 - 2 * formMargin);
          }
  
          // Open in a new tab instead of downloading
          const pdfBlob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        });
      });
    }
  }
}