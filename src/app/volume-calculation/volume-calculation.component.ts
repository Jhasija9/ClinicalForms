import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Router } from '@angular/router';
import { VisitDataService } from '../services/visit-data.service';
import { HttpClientModule } from '@angular/common/http'; // Add this import


@Component({
  selector: 'app-volume-calculation',
  templateUrl: './volume-calculation.component.html',
  styleUrls: ['./volume-calculation.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [VisitDataService]
})
export class VolumeCalculationComponent implements OnInit {
  volumeForm: FormGroup;
  rowData: any;
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private visitDataService: VisitDataService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.rowData = navigation?.extras?.state?.['data'];

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
    this.loadFormData();
  }

  loadFormData() {
    if (this.rowData) {
      this.visitDataService.getCombinedData().subscribe({
        next: (data) => {
          console.log('Combined Data:', data); // To see the data structure
          
          
          const formRecord = data.formData.find((record: any) => 
            record.id === this.rowData.id
          );
          
          if (formRecord) {
            const formatDate = (dateString: string) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];  // Returns YYYY-MM-DD
            };
            // Extract cycle and day from visit_name
            const visitMatch = formRecord.visit_name?.toLowerCase().match(/cycle\s*(\d+)\s*day\s*(\d+)/i);
          
          let cycle = '';
          let studyWeek = '';
          
          if (visitMatch) {
            // Extract cycle number (e.g., "1" from "cycle1")
            cycle = visitMatch[1];
            // Extract day number (e.g., "1" from "day1")
            studyWeek = visitMatch[2];
          }

            this.volumeForm.patchValue({
              // Patient info
              patientName: `${formRecord.first_name} ${formRecord.last_name}`,
              subjectId: formRecord.patient_id,
              cycle: cycle,  // Format as "Cycle 1"
              studyWeek: studyWeek || '',         
              dateOfService: formatDate(formRecord.start),
              screeningWeight: formRecord.screening_weight,
              weightDayOfDose: formRecord.current_weight,
              // Calculate weight difference percentage
              weightDiff: formRecord.screening_weight && formRecord.current_weight ? 
                (((formRecord.current_weight - formRecord.screening_weight) / formRecord.screening_weight) * 100).toFixed(2) : ''
            });
          }

          // Find matching study record
          const studyRecord = data.studyData.find((record: any) => 
            record.study_name === formRecord?.study_name
          );

          if (studyRecord) {
            this.volumeForm.patchValue({
              arm: studyRecord.arm_activity,
              prescribedDosage: studyRecord.prescribed_dosage,
              // Add other study-related fields as needed
            });
          }
        },
        error: (error) => {
          console.error('Error loading data:', error);
          // Handle error appropriately
        }
      });
    }
  }

  calculateVolume() {
    const formValues = this.volumeForm.value;
    
    // Add your volume calculation logic here
    // Example:
    if (formValues.prescribedDosage && formValues.decayFactor && formValues.rac) {
      const calculatedVolume = formValues.prescribedDosage / (formValues.decayFactor * formValues.rac);
      this.volumeForm.patchValue({
        calculatedVolume: calculatedVolume.toFixed(2)
      });
    }
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