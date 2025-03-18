// vial-slip.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitDataService } from '../services/visit-data.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-vial-slip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vial-slip.component.html',
  styleUrls: ['./vial-slip.component.css'],
})
export class VialSlipComponent implements OnInit {
  vialForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private visitDataService: VisitDataService
  ) {
    this.vialForm = this.fb.group({
      rx: [''],
      syringeId: [''],
      dob: [''],
      patientName: [''],
    });
  }

  ngOnInit() {
    this.fetchFormData();
  }

  fetchFormData() {
    this.visitDataService.getFormData().subscribe((data: any) => {
      if (data && data.length > 0) {
        const formattedDate = new Date(data[0].dob).toLocaleDateString('en-US');

        this.vialForm.patchValue({
          patientName: `${data[0].first_name} ${data[0].last_name}`,
          dob: formattedDate,
        });
      }
    });
  }
  generatePDF() {
    const newForm = document.getElementById('newForm'); // Select the correct form
    if (!newForm) return; // Ensure the form exists

    const inputs = newForm.querySelectorAll('input') || [];

    // Remove borders temporarily for clean PDF output
    inputs.forEach((input) => {
      input.style.border = 'none';
      input.style.outline = 'none';
      input.style.background = 'transparent';
    });

    // Convert form content to canvas
    html2canvas(newForm as HTMLElement, {
      scale: 3, // Increase scale for better resolution
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      // **Fix the Page Size to Landscape (60.45mm width × 20.32mm height)**
      const pdf = new jsPDF('l', 'mm', [20.32, 60.45]); // Landscape mode

      // Define small margins
      const margin = 2; // Keep a 2mm margin

      const pdfWidth = 60.45 - 2 * margin; // Adjust width for left & right margins
      const pdfHeight = 20.32 - 2 * margin; // Adjust height for top & bottom margins

      // Correct scaling for the small label size
      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;
      let finalWidth, finalHeight;

      if (canvasRatio > pdfRatio) {
        // Wider content, adjust height
        finalWidth = pdfWidth;
        finalHeight = (canvas.height * pdfWidth) / canvas.width;
      } else {
        // Taller content, adjust width
        finalHeight = pdfHeight;
        finalWidth = (canvas.width * pdfHeight) / canvas.height;
      }

      // Center the content properly
      const xOffset = (pdfWidth - finalWidth) / 2 + margin;
      const yOffset = (pdfHeight - finalHeight) / 2 + margin;

      // Add the form content
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        xOffset,
        yOffset,
        finalWidth,
        finalHeight
      );

      // Open the PDF in a new tab for printing
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      // Restore input styles
      inputs.forEach((input) => {
        input.style.border = '';
        input.style.outline = '';
        input.style.background = '';
      });
    });
  }
}
