import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-volume-calculation',
  templateUrl: './volume-calculation.component.html',
  styleUrls: ['./volume-calculation.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class VolumeCalculationComponent implements OnInit {
  volumeForm: FormGroup;
  decayFactors = [
    { day: 0, factor: 1.000 },
    { day: 1, factor: 0.933 },
    { day: 2, factor: 0.871 },
    { day: 3, factor: 0.812 },
    { day: 4, factor: 0.758 },
    { day: 5, factor: 0.707 },
    { day: 6, factor: 0.660 },
    { day: 7, factor: 0.616 },
    { day: 8, factor: 0.574 },
    { day: 9, factor: 0.536 },
    { day: 10, factor: 0.500 }
  ];

  constructor(private fb: FormBuilder) {
    this.volumeForm = this.fb.group({
      patientName: [''],
      arm: [''],
      subjectId: [''],
      studyWeek: [''],
      cycle: [''],
      dateOfService: [''],
      screeningWeight: [''],
      prescribedDosage: [''],
      weightDayOfDose: [''],
      weightDiff: [''],
      vialRx: [''],
      largeLabelRx: [''],
      batchCertificate: [''],
      participantId: [''],
      lotNumber: [''],
      lotNumberCert: [''],
      volume: [''],
      participantIdLarge: [''],
      timeCalibration: [''],
      activity: [''],
      rac: [''],
      racUci: [''],
      dayDifference: [''],
      decayFactor: [''],
      calculatedVolume: [''],
      targetVolume: [''],
      acceptableRangeMin: [''],
      acceptableRangeMax: [''],
      targetActivity: [''],
      acceptableActivityMin: [''],
      acceptableActivityMax: [''],
      authorizingPhysician: [''],
      signature: [''],
      date: ['']
    });
  }

  ngOnInit(): void {
  }

  calculateVolume() {
    // Add volume calculation logic here
  }
  generatePDF() {
    const data = document.getElementById('volumeForm');
    if (data) {
      const options = {
        allowTaint: true,
        background: '#ffffff',
        height: data.offsetHeight,
        width: data.offsetWidth,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowHeight: document.documentElement.scrollHeight,
        windowWidth: document.documentElement.scrollWidth,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.getElementById('volumeForm');
          if (clonedElement) {
            const button = clonedElement.querySelector('button');
            if (button instanceof HTMLElement) {
              button.style.display = 'none';
            }
          }
        }
      };

      html2canvas(data, options).then(canvas => {
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(canvas, 'PNG', 0, 0, imgWidth, Math.min(pageHeight, imgHeight));
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('VolumeCalculation.pdf');
      });
    }
  }
}