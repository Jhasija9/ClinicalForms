import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-written-directive',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './written-directive.component.html',
  styleUrls: ['./written-directive.component.css']
})
export class WrittenDirectiveComponent implements OnInit {
  wdForm: FormGroup;

  constructor() {
    this.wdForm = new FormGroup({
      // Patient Identification
      patientName: new FormControl(''),
      subjectId: new FormControl(''),
      dob: new FormControl(''),
      protocol: new FormControl(''),
      arm1: new FormControl(false),
      arm2: new FormControl(false),
      arm3: new FormControl(false),
      screeningWeight: new FormControl(''),
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

  ngOnInit() {
    // Initialize form with data if needed
  }

  generatePDF() {
    const data = document.getElementById('wdForm');
    if (data) {
      html2canvas(data).then(canvas => {
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const heightLeft = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('WrittenDirective.pdf');
      });
    }
  }
}