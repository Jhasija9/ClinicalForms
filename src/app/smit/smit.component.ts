// smit.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-smit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './smit.component.html',
  styleUrls: ['./smit.component.css']
})
export class SmitComponent {
  smitForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
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
  
    
}
