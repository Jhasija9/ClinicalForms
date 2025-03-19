import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { VisitData } from '../models/visit-data';
import { VisitDataService } from '../services/visit-data.service';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-written-directive',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './written-directive.component.html',
  styleUrls: ['./written-directive.component.css'],
})
export class WrittenDirectiveComponent implements OnInit {
  wdForm: FormGroup;

  constructor(private http: HttpClient,     private dataservice: VisitDataService  
  ) {
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
    this.setupAssignedDoseSync();
    this.setupPrescribedDosageSync();
    this.setupVialActivitySync();
    this.setupSyringeActivitySync();
    this.setupNetActivitySync();
    this.setupResidualActivitySync();
    this.http.get<any>('http://localhost:3001/api/form-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response.find((x: { patient_id: string; })=>x.patient_id == this.dataservice.currentPatientID);
          
          console.log('data :>> ', data);
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
              arm1: data.arm_name.trim() === 'Arm 1',
              arm2: data.arm_name.trim() === 'Arm 2',
              arm3: data.arm_name.trim() === 'Arm 3',    
               // Convert from kBq to MBq

          });
        }
        this.loadData()
        this.setupFormValueSubscriptions();

        
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
  private setupResidualActivitySync() {
    this.setupTwoWaySync('residualActivityKbq', 'residualActivityUci', 37);
  }
  
  private setupNetActivitySync() {
    this.setupTwoWaySync('netActivityKbq', 'netActivityUci', 37);
  }
  
  private setupSyringeActivitySync() {
    this.setupTwoWaySync('syringeActivityKbq', 'syringeActivityUci', 37);
  }
  
  // ✅ Generic function for 2-way binding (kBq ⇄ Uci conversions)
  private setupTwoWaySync(kbqField: string, uciField: string, conversionFactor: number) {
    this.wdForm.get(kbqField)?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const kbqValue = parseFloat(value);
      if (!isNaN(kbqValue)) {
        const uciValue = (kbqValue / conversionFactor).toFixed(2);
        this.wdForm.patchValue({ [uciField]: uciValue }, { emitEvent: false });
      }
    });
  
    this.wdForm.get(uciField)?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const uciValue = parseFloat(value);
      if (!isNaN(uciValue)) {
        const kbqValue = (uciValue * conversionFactor).toFixed(2);
        this.wdForm.patchValue({ [kbqField]: kbqValue }, { emitEvent: false });
      }
    });
  }
  private setupVialActivitySync() {
    this.wdForm.get('vialActivityKbq')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const vialActivityKbq = parseFloat(value);
      if (!isNaN(vialActivityKbq)) {
        const vialActivityUci = (vialActivityKbq / 37).toFixed(2);
        this.wdForm.patchValue({ vialActivityUci }, { emitEvent: false }); // Prevent infinite loop
      }
    });
  
    this.wdForm.get('vialActivityUci')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const vialActivityUci = parseFloat(value);
      if (!isNaN(vialActivityUci)) {
        const vialActivityKbq = (vialActivityUci * 37).toFixed(2);
        this.wdForm.patchValue({ vialActivityKbq }, { emitEvent: false }); // Prevent infinite loop
      }
    });
  }

  private setupFormValueSubscriptions() {
    this.wdForm.get('radiopharmaceutical')?.valueChanges.subscribe(value => {
      this.dataservice.Radio = value;
    });

    this.wdForm.get('DOB')?.valueChanges.subscribe(value => {
      this.dataservice.DOB = value;
    });

    this.wdForm.get('patientName')?.valueChanges.subscribe(value => {
      this.dataservice.PtientName = value;
    });

    this.wdForm.get('DOS')?.valueChanges.subscribe(value => {
      this.dataservice.DOS = value;
    });

    this.wdForm.get('rx_batch')?.valueChanges.subscribe(value => {
      this.dataservice.RX = value;
    });

    this.wdForm.get('syringeId')?.valueChanges.subscribe(value => {
      this.dataservice.RX = value;  // Consider using a different field instead of overwriting RX
    });
  }
  private setupPrescribedDosageSync() {
    this.wdForm.get('prescribedDosage')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const prescribedDosage = parseFloat(value);
      if (!isNaN(prescribedDosage)) {
        const prescribedDosageUci = (prescribedDosage / 37).toFixed(2);
        this.wdForm.patchValue({ prescribedDosageUci }, { emitEvent: false }); // Prevent infinite loop
      }
    });
  
    this.wdForm.get('prescribedDosageUci')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const prescribedDosageUci = parseFloat(value);
      if (!isNaN(prescribedDosageUci)) {
        const prescribedDosage = (prescribedDosageUci * 37).toFixed(2);
        this.wdForm.patchValue({ prescribedDosage }, { emitEvent: false }); // Prevent infinite loop
      }
    });
  }
  private setupAssignedDoseSync() {
    this.wdForm.get('assignedDose')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const assignedDose = parseFloat(value);
      if (!isNaN(assignedDose)) {
        const assignedDoseMCi = (assignedDose / 37).toFixed(2);
        this.wdForm.patchValue({ assignedDoseMCi }, { emitEvent: false }); // Prevent infinite loop
      }
    });
  
    this.wdForm.get('assignedDoseMCi')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const assignedDoseMCi = parseFloat(value);
      if (!isNaN(assignedDoseMCi)) {
        const assignedDose = (assignedDoseMCi * 37).toFixed(2);
        this.wdForm.patchValue({ assignedDose }, { emitEvent: false }); // Prevent infinite loop
      }
    });
  }
  generatePDF() {
    const header = document.querySelector('.header'); // Capture header separately
    const formContent = document.querySelector('form'); // Capture form content separately
    const inputs = document.querySelectorAll('input');
    this.dataservice.Radio = this.wdForm.get('radiopharmaceutical')?.value;
    this.dataservice.DOB = this.wdForm.get('')?.value;
    this.dataservice.PtientName = this.wdForm.get('patientName')?.value;
    this.dataservice.DOS = this.wdForm.get('DOS')?.value;
    this.dataservice.RX = this.wdForm.get('rx_batch')?.value;
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

    this.dataservice.Radio = this.wdForm.get('radiopharmaceutical')?.value;
    this.dataservice.DOB = this.wdForm.get('')?.value;
    this.dataservice.PtientName = this.wdForm.get('patientName')?.value;
    this.dataservice.DOS = this.wdForm.get('DOS')?.value;
    this.dataservice.RX = this.wdForm.get('rx_batch')?.value;
    this.dataservice.RX = this.wdForm.get('syringeId')?.value;

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

  
    this.http.get<any>(`http://localhost:3001/api/load-dos-details/${patientId}/${DOS}`).subscribe({
      next: (response) => {
        if (Object.keys(response).length === 0) {
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
