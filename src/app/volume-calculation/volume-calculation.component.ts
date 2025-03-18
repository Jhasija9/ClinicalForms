import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Router } from '@angular/router';
import { VisitDataService } from '../services/visit-data.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Add this import


@Component({
  selector: 'app-volume-calculation',
  templateUrl: './volume-calculation.component.html',
  styleUrls: ['./volume-calculation.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [VisitDataService],
})
export class VolumeCalculationComponent implements OnInit {
  volumeForm: FormGroup;
  rowData: any;
  decayFactors = [
    { day: 0, factor: 1.0 },
    { day: 1, factor: 0.933 },
    { day: 2, factor: 0.871 },
    { day: 3, factor: 0.812 },
    { day: 4, factor: 0.758 },
    { day: 5, factor: 0.707 },
    { day: 6, factor: 0.66 },
    { day: 7, factor: 0.616 },
    { day: 8, factor: 0.574 },
    { day: 9, factor: 0.536 },
    { day: 10, factor: 0.5 },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private visitDataService: VisitDataService,
    private http: HttpClient
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
      date: [''],
      vialTime: [''],
      photoAttached: [false],
      section3Filled: [false],
      //  screeningWeight: [''],  // from section 1
      dayOfDoseWeight: [''], // from section 2
      weightDifference: [''],
    });
  }
  calcState = 0;
  ngOnInit(): void {
    this.loadFormData();
    this.volumeForm.get('vialTime')?.valueChanges.subscribe((value) => {
      if (value) {
          this.calculateDayDifference(value);

      }
  });
  this.volumeForm.get('prescribedDosage')?.valueChanges.subscribe(() => {
    this.calculateVolume();

});

    this.volumeForm.get('racUci')?.valueChanges.subscribe(() => {
      this.calculateVolume();
    });
    this.volumeForm.get('dayOfDoseWeight')?.valueChanges.subscribe(() => {
      this.calculateWeightDifference();
    });
    this.volumeForm.get('rac')?.valueChanges.subscribe(() => {
      this.kbqtomci();
    });
    this.volumeForm.get('racUci')?.valueChanges.subscribe(() => {
      this.mcitokbq();
    });
  }

  loadFormData() {
    if (this.rowData) {
      this.visitDataService.getCombinedData().subscribe({
        next: (data) => {
          console.log('Combined Data:', data); // To see the data structure

          const formRecord = data.formData.find(
            (record: any) => record.id === this.rowData.id
          );

          if (formRecord) {
            const formatDate = (dateString: string) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
            };
            // Extract cycle and day from visit_name
            const visitMatch = formRecord.visit_name
              ?.toLowerCase()
              .match(/cycle\s*(\d+)\s*day\s*(\d+)/i);

            let cycle = '';
            let studyWeek = '';

            if (visitMatch) {
              // Extract cycle number (e.g., "1" from "cycle1")
              cycle = visitMatch[1];
              // Extract day number (e.g., "1" from "day1")
              studyWeek = visitMatch[2];
            }
            const studyRecord = data.studyData.find(
              (record: any) => record.study_name === formRecord.protocol_number
            );

            if (studyRecord && studyRecord.arm_activity) {
              // Find matching arm activity based on arm_name
              const matchingArm = studyRecord.arm_activity.find(
                (arm: any) => arm.arm === formRecord.arm_name
              );

              if (matchingArm) {
                this.volumeForm.patchValue({
                  arm: `${matchingArm.activity} ${matchingArm.activity_unit}`, // This will be 50, 75, or 100
                });
              }
            }

            this.volumeForm.patchValue({
              // Patient info
              patientName: `${formRecord.first_name} ${formRecord.last_name}`,
              subjectId: formRecord.patient_id,
              cycle: cycle, // Format as "Cycle 1"
              studyWeek: studyWeek || '',
              dateOfService: formatDate(formRecord.start),
              screeningWeight: (formRecord.screening_weight*0.453592).toFixed(2),
              weightDayOfDose: formRecord.current_weight,
              // Calculate weight difference percentage
              weightDiff:
                formRecord.screening_weight && formRecord.current_weight
                  ? (
                      ((formRecord.current_weight -
                        formRecord.screening_weight) /
                        formRecord.screening_weight) *
                      100
                    ).toFixed(2)
                  : '',
            });
          }

          // Find matching study record
          const studyRecord = data.studyData.find(
            (record: any) => record.study_name === formRecord?.study_name
          );

          if (studyRecord) {
            this.volumeForm.patchValue({
              arm: studyRecord.arm_activity,
              prescribedDosage: studyRecord.prescribed_dosage,
              // Add other study-related fields as needed
            });
          }
          this.loadData();

        },
        error: (error) => {
          console.error('Error loading data:', error);
          // Handle error appropriately
        },
      });
    }
  }

  calculateDayDifference(vialDate: string) {
    // Get current date/time
    const now = new Date();

    // Convert vial date string to Date object
    const vialTime = new Date(vialDate);

    // Calculate difference in milliseconds
    const diffTime = Math.abs(now.getTime() - vialTime.getTime());

    // Convert to days and round to nearest integer
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const decayFactor =
      this.decayFactors.find((df) => df.day === diffDays)?.factor || '';

    // Update the dayDifference field
    this.volumeForm.patchValue({
      dayDifference: diffDays,
      decayFactor: decayFactor,
    });
    this.calculateVolume();
  }
  delayedFunction() {
    setTimeout(() => {
      console.log('Executed after 1 second');
      this.calcState = 0; // Call your function here
    }, 1000);
  }
  calculateVolume() {
    const prescribedDose = this.volumeForm.get('prescribedDosage')?.value;
    const decayFactor = this.volumeForm.get('decayFactor')?.value;
    const racUci = this.volumeForm.get('racUci')?.value;

    if (prescribedDose && decayFactor && racUci) {
      const targetVolume = prescribedDose / (decayFactor * racUci);
      // const tenPercent = targetVolume * 0.10;
      // const minRange = (targetVolume - tenPercent).toFixed(2);
      // const maxRange = (targetVolume + tenPercent).toFixed(2);

      const targetActivity = targetVolume * racUci;

      // Calculate ±10% ranges for both volume and activity
      const tenPercentVolume = targetVolume * 0.1;
      const tenPercentActivity = targetActivity * 0.1;

      this.volumeForm.patchValue({
        targetVolume: targetVolume.toFixed(2),
        acceptableRangeMin: (targetVolume - tenPercentVolume).toFixed(2),
        acceptableRangeMax: (targetVolume + tenPercentVolume).toFixed(2),
        targetActivity: targetActivity.toFixed(2),
        acceptableActivityMin: (targetActivity - tenPercentActivity).toFixed(2),
        acceptableActivityMax: (targetActivity + tenPercentActivity).toFixed(2),
      });
      console.log('Target Volume:', targetVolume);
    }
  }
  calculateWeightDifference() {
    const screeningWeight = this.volumeForm.get('screeningWeight')?.value;
    const dayOfDoseWeight = this.volumeForm.get('dayOfDoseWeight')?.value;
    console.log('=======> ', screeningWeight, dayOfDoseWeight);
    if (screeningWeight && dayOfDoseWeight) {
      // Calculate weight difference percentage
      // (Screening - Day of Dose) / Screening * 100
      const weightDiff =
        ((screeningWeight - dayOfDoseWeight) / screeningWeight) * 100;

      // Round to 2 decimal places
      const formattedWeightDiff = Math.abs(weightDiff).toFixed(2);

      this.volumeForm.patchValue({
        weightDifference: formattedWeightDiff,
      });
      console.log('Weight Difference:', formattedWeightDiff);
      // Warning if difference > 10%
      // if (Math.abs(weightDiff) > 10) {
      //     console.warn('Weight difference exceeds 10% - call sponsor');
      // }
    }
  }
  kbqtomci() {
    if (this.calcState == 1) return;
    this.calcState = 1;
    const rac = this.volumeForm.get('rac')?.value;
    const mCi = rac * 0.027;
    this.volumeForm.patchValue({
      racUci: mCi,
    });
    this.delayedFunction();
  }

  mcitokbq() {
    if (this.calcState === 1) return;
    this.calcState = 1;
    const mCi = this.volumeForm.get('racUci')?.value;
    const kBq = mCi * 37;
    this.volumeForm.patchValue({
      rac: kBq,
    });
    this.delayedFunction();
  }

  generatePDF() {
    const data = document.getElementById('volumeForm');
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
      input.style.border = 'none';
      input.style.outline = 'none';
      input.style.background = 'transparent';
    });
    if (data) {
      const options = {
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.getElementById('volumeForm');
          if (clonedElement) {
            const button = clonedElement.querySelector('button');
            if (button instanceof HTMLElement) {
              button.style.display = 'none';
            }
          }
        },
      };
  
      html2canvas(data, options).then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');
  
        const imgWidth = 190; // A4 width (210mm - 20mm margins)
        const pageHeight = 297; // A4 height in mm
        const formMargin = 12.7; // 0.5 inches = 12.7 mm
            // Restore input field styles after rendering
            inputs.forEach((input) => {
              input.style.border = '';
              input.style.outline = '';
              input.style.background = '';
            });
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const maxHeight = pageHeight - formMargin; // Maximum height for one page
  
        pdf.addImage(canvas, 'PNG', 10, formMargin, imgWidth, Math.min(maxHeight, imgHeight));
  
        // Open in new tab (DO NOT ADD MORE PAGES)
        const pdfBlob = pdf.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL, '_blank');
      });
    }
  }
  loadData() {
    const patientId = this.volumeForm.get('subjectId')?.value;
    const DOS = this.volumeForm.get('dateOfService')?.value;
  
    console.log('DOS :>> ', DOS);
    console.log('patientId :>> ', patientId);
    if (!patientId || !DOS) {
      alert('Please enter Patient ID and Date of Service first.');
      return;
    }
  
    this.http.get<any>(`http://localhost:3001/api/load-dos-details/${patientId}/${DOS}`).subscribe({
      next: (response) => {
        console.log('re :>> ', response);
        if (Object.keys(response).length === 0) {
          alert('No data found for this patient and date.');
        } else {
          console.log('response :>> ', response);
          this.volumeForm.patchValue({
            prescribedDosage: response.prescribedDosage,

          }
            
          );
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
        alert('Error loading data');
      },
    });
  }
}
