// smit.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { VisitDataService } from '../services/visit-data.service';

@Component({
  selector: 'app-smit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './smit.component.html',
  styleUrls: ['./smit.component.css']
})
export class SmitComponent {
  smitForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private dataservice:VisitDataService) {
    this.smitForm = this.fb.group({
      syringeId: [''],
      activityKBq: [''],
      activityUCi: [''],
      date: [''],
      time: [''],
      volume: [''],
      vialRx: [''],
      patientName: [''],
      subjectId: [''],
      dob: [''],
      expirationDate: [''],
      expirationTime: [''],
      technologistName: [''],
      signature: [''],
      radiopharmaceutical: [''],
    });
  }

  ngOnInit() {
    this.smitForm.patchValue({
      radiopharmaceutical: this.dataservice.Radio || '',
      dob: this.dataservice.DOB.substring(0,10) || '',
      patientName: this.dataservice.PtientName || '', // Fixed typo from 'PtientName'
      vialRx: this.dataservice.RX || '',
      subjectId:this.dataservice.currentPatientID ||"",
      syringeId: this.dataservice.SyringeId ||"",
    });
    console.log('this.dataservice.SyringeId :>> ', this.dataservice.SyringeId);
    this.loadData();
  }

  goBack() {
    this.router.navigate(['/visit-data']);
  }
  generatePDF() {
    const smitForm = document.getElementById('smitForm'); // Ensure correct form container
    const header = smitForm?.querySelector('.header'); // Capture header inside smitForm
    const formContent = smitForm?.querySelector('form'); // Capture form inside smitForm
    const inputs = smitForm?.querySelectorAll('input') || [];
  
    if (!smitForm || !header || !formContent) return; // Ensure elements exist
  
    // Remove borders temporarily for clean PDF output
    inputs.forEach((input) => {
      input.style.border = 'none';
      input.style.outline = 'none';
      input.style.background = 'transparent';
    });
  
    // Convert header to canvas
    html2canvas(header as HTMLElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((headerCanvas) => {
      // Convert form content to canvas
      html2canvas(formContent as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      }).then((formCanvas) => {
        // Set custom page size: 4 × 6 inches (101.6 mm × 152.4 mm)
        const pdf = new jsPDF('p', 'mm', [152.4, 101.6]);
  
        // Define margins
        const margin = 5; // Keep a 5mm margin
  
        const pdfWidth = 101.6 - 2 * margin; // Adjust for left & right margins
        const headerHeight =
          (headerCanvas.height * pdfWidth) / headerCanvas.width;
        const formHeight = (formCanvas.height * pdfWidth) / formCanvas.width;
  
        let heightLeft = formHeight;
        let position = margin; // Start after the margin
  
        // Add the header
        pdf.addImage(
          headerCanvas.toDataURL('image/png'),
          'PNG',
          margin,
          position,
          pdfWidth,
          headerHeight
        );
        position += headerHeight + margin; // Adjust position for form after margin
  
        // Add the first page of the form content
        pdf.addImage(
          formCanvas.toDataURL('image/png'),
          'PNG',
          margin,
          position,
          pdfWidth,
          Math.min(formHeight, 152.4 - position - margin)
        );
        heightLeft -= 152.4 - position - margin;
        position = 152.4 - margin;
  
        // If content overflows, add new pages
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(
            formCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            -position + margin,
            pdfWidth,
            formHeight
          );
          heightLeft -= 152.4 - 2 * margin;
          position += 152.4 - 2 * margin;
        }
  
        // Open the PDF in a new tab instead of downloading
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      });
    });
  }
  loadData() {
    const patientId = this.smitForm.get('subjectId')?.value;
    const DOS = this.dataservice.DOS.substring(0,10) ;
  
    console.log('DOS :>> ', DOS);
    console.log('patientId :>> ', patientId);

    this.http.get<any>('http://localhost:3001/api/study-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response[0];
          console.log(data);
          this.smitForm.patchValue({
            radiopharmaceutical: data.radiopharmaceutical || ''
          });
        }

      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
    this.http.get<any>(`http://localhost:3001/api/load-dos-details/${patientId}/${DOS}`).subscribe({
      next: (response) => {
        if (Object.keys(response).length === 0) {
        } else {
          console.log('response :>> ', response);
          this.smitForm.patchValue(response);
          this.smitForm.patchValue({
            volume: response.syringeVolume
          });
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
        alert('Error loading data');
      },
    });
  }
    
}
