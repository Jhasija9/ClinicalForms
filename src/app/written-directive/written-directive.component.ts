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
      DOS: new FormControl(''),
      study_name: new FormControl(''),
      visit: new FormControl(''),
      weightDayOfDose: new FormControl(''),
      dateCalibration: new FormControl(''),
      timeCalibration: new FormControl(''),
      rac: new FormControl(''),
      racUci: new FormControl(''),
      three_label_pictures: new FormControl(false),
      fill_sec3_wd: new FormControl(false),
      send_forms: new FormControl(false),
      prescribedDosage: new FormControl(''),
      prescribedDosageUci: new FormControl(''),
      manufacturer: new FormControl(''),
      containerId: new FormControl(''),
      rx_batch: new FormControl(''),
      lotBatch: new FormControl(''),
      quality: new FormControl(false),
      form: new FormControl(''),
      volume: new FormControl(''),
      vialActivityKbq: new FormControl(''),
      vialActivityUci: new FormControl(''),
      vial_activity_date: new FormControl(''),
      vial_activity_time: new FormControl(''),
      syringeId: new FormControl(''),
      syringeVolume: new FormControl(''),
      syringeActivityKbq: new FormControl(''),
      syringeActivityUci: new FormControl(''),
      syringe_activity_date: new FormControl(''),
      syringe_activity_time: new FormControl(''),
      proposed_administration_date: new FormControl(''),
      proposed_administration_time: new FormControl(''),
      treatmentNumber: new FormControl(''),
      signature: new FormControl(''),
      signatureDate: new FormControl(''),
      signatureTime: new FormControl(''),
      radiopharmaceutical: new FormControl(''),
      administeredBy: new FormControl(''),
      residualActivityKbq: new FormControl(''), // ✅ Added missing control
      residualActivityUci: new FormControl(''),
      residualDate: new FormControl(''),
      residualTime: new FormControl(''),
      residualInitials: new FormControl(''),
      netActivityUci: new FormControl(''), // ✅ Added missing control
      netActivityKbq: new FormControl(''), // ✅ Added missing control
      physicianSignature: new FormControl(''), // ✅ Added missing control
      arm1: new FormControl(false),
      arm2: new FormControl(false),
      arm3: new FormControl(false),
      assignedDose: new FormControl(''),
      assignedDoseMCi: new FormControl(''),
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
      impDate: new FormControl(''),
      impTime: new FormControl(''),
      impInitials: new FormControl(''),
      qualityInitials: new FormControl(''),
      syringeInitials: new FormControl(''),
      syringeTime: new FormControl(''),
      syringeDate: new FormControl(''),
      screeningWeight: new FormControl(''),
      dob: new FormControl(''),
    });
  }
  calculateAssignedDose() {
    const screeningWeight = this.wdForm.get('screeningWeight')?.value || 0;
    let dosePerKg = 0;
    
    if (this.wdForm.get('arm1')?.value) {
      dosePerKg = 50;  // Arm 1: 50 kBq/kg
    } else if (this.wdForm.get('arm2')?.value) {
      dosePerKg = 75;  // Arm 2: 75 kBq/kg
    } else if (this.wdForm.get('arm3')?.value) {
      dosePerKg = 100; // Arm 3: 100 kBq/kg
    }
  
    const assignedDose = dosePerKg * screeningWeight;
    const assignedDoseMCi = (assignedDose/37).toFixed(2);;
    this.wdForm.patchValue({
      assignedDose: assignedDose,
      assignedDoseMCi: assignedDoseMCi,
    });
  }
  private formatTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    
    // Parse the ISO string and extract hours and minutes
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  ngOnInit() {
    this.http.get<any>('http://localhost:3001/api/form-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response[0];
          console.log(data.start ? data.start.split('T')[1] : '');
          console.log(data.arm_name );
          console.log(data);
          this.wdForm.get('arm1')?.valueChanges.subscribe(() => {
            this.calculateAssignedDose();
          });
          this.wdForm.get('arm2')?.valueChanges.subscribe(() => {
            this.calculateAssignedDose();
          });
          this.wdForm.get('arm3')?.valueChanges.subscribe(() => {
            this.calculateAssignedDose();
          });
          this.wdForm.patchValue({
            patientName:
              data.first_name && data.last_name
                ? `${data.first_name} ${data.last_name}`
                : '',
            subjectId: data.patient_id || '',
            dob: data.dob ? data.dob.split('T')[0] : '',
            screeningWeight: data.screening_weight || '',
            // assignedDoseMCi= data.assignedDose / 37,
            proposed_administration_date: data.start
              ? data.start.split('T')[0]
              : '',
            proposed_administration_time: this.formatTime(data.start),
              arm1: data.arm_name === 'Arm 1',
              arm2: data.arm_name === 'Arm 2',
              arm3: data.arm_name === 'Arm 3',    
               // Convert from kBq to MBq

          });
        }
        this.loadData()

      },

      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });

    this.http.get<any>('http://localhost:3001/api/study-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response[0];
          console.log(data);
          this.wdForm.patchValue({
            radiopharmaceutical: data.radiopharmaceutical || '',
            route_of_administration: data.route_of_administration || '',
            authorizedUser: data.PI || '',
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
  
    // Temporarily remove borders for clean PDF output
    inputs.forEach((input) => {
      input.style.border = 'none';
      input.style.outline = 'none';
      input.style.background = 'transparent';
    });
  
    if (header && formContent) {
      html2canvas(header as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      }).then((headerCanvas) => {
        html2canvas(formContent as HTMLElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        }).then((formCanvas) => {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = 210; // A4 width in mm
          const pdfHeight = 297; // A4 height in mm
  
          const margin = 10;
          const availableHeight = pdfHeight - 2 * margin; // Space for content
  
          // Restore input field styles after rendering
          inputs.forEach((input) => {
            input.style.border = '';
            input.style.outline = '';
            input.style.background = '';
          });
  
          // Add the header at the top
          const headerHeight =
            (headerCanvas.height * (pdfWidth - 2 * margin)) / headerCanvas.width;
          pdf.addImage(
            headerCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            margin,
            pdfWidth - 2 * margin,
            headerHeight
          );
  
          let yPosition = margin + headerHeight + 5; // Position after the header
  
          // Split the form into sections that fit in pages
          let pageHeightLeft = availableHeight - headerHeight - 10;
          let formImageHeight =
            (formCanvas.height * (pdfWidth - 2 * margin)) / formCanvas.width;
  
          let formImageY = 0; // Track the form image Y offset
  
          while (formImageY < formCanvas.height) {
            // Determine the part of the image to add on the current page
            let sliceHeight = Math.min(pageHeightLeft, formImageHeight);
  
            // Capture the portion of the form for the current page
            const formPartCanvas = document.createElement('canvas');
            formPartCanvas.width = formCanvas.width;
            formPartCanvas.height = (sliceHeight * formCanvas.width) / pdfWidth;
  
            const formPartContext = formPartCanvas.getContext('2d');
            if (formPartContext) {
              formPartContext.drawImage(
                formCanvas,
                0,
                formImageY,
                formCanvas.width,
                formPartCanvas.height,
                0,
                0,
                formCanvas.width,
                formPartCanvas.height
              );
  
              pdf.addImage(
                formPartCanvas.toDataURL('image/png'),
                'PNG',
                margin,
                yPosition,
                pdfWidth - 2 * margin,
                sliceHeight
              );
  
              formImageY += formPartCanvas.height; // Move to next section
              yPosition += sliceHeight; // Move the cursor down
              pageHeightLeft -= sliceHeight;
            }
  
            // If content overflows, add a new page
            if (formImageY < formCanvas.height) {
              pdf.addPage();
              yPosition = margin; // Reset Y position for the new page
              pageHeightLeft = availableHeight; // Reset page height
            }
          }
  
          // Open PDF in a new tab
          const pdfBlob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        });
      });
    }
  }
  saveData() {
    const formData = this.wdForm.value;
    console.log('Saving data:', formData);

    this.http.post('http://localhost:3001/api/save-dos-details', formData).subscribe({
      next: (response) => {
        console.log('Data saved successfully', response);
        alert('Data saved successfully');
      },
      error: (error) => {
        console.error('Error saving data:', error);
        alert('Error saving data');
      },
    });
  }
  loadData() {
    const patientId = this.wdForm.get('subjectId')?.value;
    const DOS = this.wdForm.get('proposed_administration_date')?.value;
  
    console.log('DOS :>> ', DOS);
    console.log('patientId :>> ', patientId);
    if (!patientId || !DOS) {
      alert('Please enter Patient ID and Date of Service first.');
      return;
    }
  
    this.http.get<any>(`http://localhost:3001/api/load-dos-details/${patientId}/${DOS}`).subscribe({
      next: (response) => {
        if (Object.keys(response).length === 0) {
          alert('No data found for this patient and date.');
        } else {
          console.log('response :>> ', response);
          this.wdForm.patchValue(response);
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
        alert('Error loading data');
      },
    });
  }
}
