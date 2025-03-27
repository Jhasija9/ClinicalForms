// form-ordering.component.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { VisitDataService } from '../services/visit-data.service';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-form-ordering',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './form-ordering.component.html',
  styleUrls: ['./form-ordering.component.css'],
})
export class FormOrderingComponent implements OnInit {
  orderForm: FormGroup;

  constructor(
    private http: HttpClient,     
    private dataservice: VisitDataService  
  ) {
    this.orderForm = new FormGroup({
      // Section 1: Patient Information
      patientName: new FormControl(''),
      subjectId: new FormControl(''),
      dob: new FormControl(''),
      screeningWeight: new FormControl(''),
      DOS: new FormControl(''),

      // Section 2: Treatment Information
      arm1: new FormControl(false),
      arm2: new FormControl(false),
      arm3: new FormControl(false),
      assignedDose: new FormControl(''),
      assignedDoseMCi: new FormControl(''),
      radiopharmaceutical: new FormControl(''),
      route_of_administration: new FormControl(''),
      prescribedDosage: new FormControl(''),
      prescribedDosageUci: new FormControl(''),
      proposed_administration_date: new FormControl(''),
      proposed_administration_time: new FormControl(''),
      authorizedUser: new FormControl(''),
      physicianSignature: new FormControl(''),
      signatureDate: new FormControl(''),
      signatureTime: new FormControl('')
    });
  }

  calculateAssignedDose() {
    const screeningWeight = this.orderForm.get('screeningWeight')?.value || 0;
    let dosePerKg = 0;
    
    if (this.orderForm.get('arm1')?.value) {
      dosePerKg = 50;
    } else if (this.orderForm.get('arm2')?.value) {
      dosePerKg = 75;
    } else if (this.orderForm.get('arm3')?.value) {
      dosePerKg = 100;
    }
  
    const assignedDose = dosePerKg * screeningWeight;
    const assignedDoseMCi = (assignedDose/37).toFixed(2);
    this.orderForm.patchValue({
      assignedDose: assignedDose,
      assignedDoseMCi: assignedDoseMCi,
    });
  }

  private formatTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  ngOnInit() {
    this.setupAssignedDoseSync();
    this.setupPrescribedDosageSync();
    
    // Load patient data
    this.http.get<any>('http://localhost:3001/api/form-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response.find((x: { patient_id: string; }) => 
            x.patient_id == this.dataservice.currentPatientID
          );
          
          if (data) {
            // Setup arm change listeners
            ['arm1', 'arm2', 'arm3'].forEach(arm => {
              this.orderForm.get(arm)?.valueChanges.subscribe(() => {
                this.calculateAssignedDose();
              });
            });
          

            // Patch form values
            this.orderForm.patchValue({
              patientName: `${data.first_name} ${data.last_name}`,
              subjectId: data.patient_id,
              dob: data.dob ? data.dob.split('T')[0] : '',
              screeningWeight: data.screening_weight,
              proposed_administration_date: data.start ? data.start.split('T')[0] : '',
              proposed_administration_time: this.formatTime(data.start),
              prescribedDosage: data.prescribedDosage,
              arm1: data.arm_name.trim() === 'Arm 1',
              arm2: data.arm_name.trim() === 'Arm 2',
              arm3: data.arm_name.trim() === 'Arm 3',
            //   arm1: armName === 'Arm 1',
            // arm2: armName === 'Arm 2',
            // arm3: armName === 'Arm 3'
            });
            console.log('Arm name from data:', data.arm_name);
            console.log('Form values after patch:', this.orderForm.value);
          }
        }
        
        this.loadData();
        this.setupFormValueSubscriptions();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });

    // Load study data
    this.http.get<any>('http://localhost:3001/api/study-data').subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response[0];
          this.orderForm.patchValue({
            radiopharmaceutical: data.radiopharmaceutical,
            route_of_administration: data.route_of_administration,
            authorizedUser: data.PI,
            prescribedDosage: data.prescribedDosage,
          });
        }
      },
      error: (error) => {
        console.error('Error fetching study data:', error);
      },
    });
  }

  private setupFormValueSubscriptions() {
    const fields = {
      'radiopharmaceutical': 'Radio',
      'DOS': 'DOS',
      'patientName': 'PtientName',
    };

    Object.entries(fields).forEach(([formField, serviceField]) => {
      this.orderForm.get(formField)?.valueChanges.subscribe(value => {
        (this.dataservice as any)[serviceField] = value;
      });
    });
  }

  private setupPrescribedDosageSync() {
    this.setupTwoWaySync('prescribedDosage', 'prescribedDosageUci', 37);
  }

  private setupAssignedDoseSync() {
    this.setupTwoWaySync('assignedDose', 'assignedDoseMCi', 37);
  }

  private setupTwoWaySync(field1: string, field2: string, conversionFactor: number) {
    this.orderForm.get(field1)?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const val1 = parseFloat(value);
      if (!isNaN(val1)) {
        const val2 = (val1 / conversionFactor).toFixed(2);
        this.orderForm.patchValue({ [field2]: val2 }, { emitEvent: false });
      }
    });

    this.orderForm.get(field2)?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      const val2 = parseFloat(value);
      if (!isNaN(val2)) {
        const val1 = (val2 * conversionFactor).toFixed(2);
        this.orderForm.patchValue({ [field1]: val1 }, { emitEvent: false });
      }
    });
  }

  generatePDF() {
    const header = document.querySelector('.header'); // Capture header separately
    const formContent = document.querySelector('form'); // Capture form content separately
    const inputs = document.querySelectorAll('input');
    this.dataservice.Radio = this.orderForm.get('radiopharmaceutical')?.value;
    this.dataservice.DOB = this.orderForm.get('')?.value;
    this.dataservice.PtientName = this.orderForm.get('patientName')?.value;
    this.dataservice.DOS = this.orderForm.get('DOS')?.value;
    this.dataservice.RX = this.orderForm.get('rx_batch')?.value;
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

  // form-ordering.component.ts

  // form-ordering.component.ts

  // form-ordering.component.ts

// form-ordering.component.ts

saveData() {
  const formData = this.orderForm.value;

  // First get existing data
  this.http.get<any>(`http://localhost:3001/api/load-dos-details/${formData.subjectId}/${formData.proposed_administration_date}`)
    .subscribe({
      next: (existingData) => {
        // Only create new status if one doesn't exist
        if (existingData && existingData.status_id) {
          // Use existing status_id and save all form data
          const dataToSave = {
            // Patient Identification Section
            patientName: formData.patientName,
            subjectId: formData.subjectId,
            dob: formData.dob,
            arm1: formData.arm1,
            arm2: formData.arm2,
            arm3: formData.arm3,
            screeningWeight: formData.screeningWeight,
            assignedDose: formData.assignedDose,
            assignedDoseMCi: formData.assignedDoseMCi,

            // Dose Ordering Section
            radiopharmaceutical: formData.radiopharmaceutical,
            prescribedDosage: formData.prescribedDosage,
            prescribedDosageUci: formData.prescribedDosageUci,
            route_of_administration: 'IV',
            proposed_administration_date: formData.proposed_administration_date,
            proposed_administration_time: formData.proposed_administration_time,
            authorizedUser: formData.authorizedUser,
            physicianSignature: formData.physicianSignature,
            signatureDate: formData.signatureDate,
            signatureTime: formData.signatureTime,

            // Use existing status_id
            status_id: existingData.status_id
          };

          this.http.post('http://localhost:3001/api/save-dos-details', dataToSave)
            .subscribe({
              next: (response) => {
                console.log('Saved successfully with existing status_id:', existingData.status_id);
                alert('Saved successfully');
              },
              error: (err) => {
                console.error('Save error:', err);
                alert('Error saving');
              }
            });

        } else {
          // Create new status and save all form data
          this.http.post('http://localhost:3001/api/create-status', {})
            .subscribe({
              next: (statusResponse: any) => {
                const dataToSave = {
                  // Patient Identification Section
                  patientName: formData.patientName,
                  subjectId: formData.subjectId,
                  dob: formData.dob,
                  arm1: formData.arm1,
                  arm2: formData.arm2,
                  arm3: formData.arm3,
                  screeningWeight: formData.screeningWeight,
                  assignedDose: formData.assignedDose,
                  assignedDoseMCi: formData.assignedDoseMCi,

                  // Dose Ordering Section
                  radiopharmaceutical: formData.radiopharmaceutical,
                  prescribedDosage: formData.prescribedDosage,
                  prescribedDosageUci: formData.prescribedDosageUci,
                  route_of_administration: 'IV',
                  proposed_administration_date: formData.proposed_administration_date,
                  proposed_administration_time: formData.proposed_administration_time,
                  authorizedUser: formData.authorizedUser,
                  physicianSignature: formData.physicianSignature,
                  signatureDate: formData.signatureDate,
                  signatureTime: formData.signatureTime,

                  // Use new status_id
                  status_id: statusResponse.id
                };

                this.http.post('http://localhost:3001/api/save-dos-details', dataToSave)
                  .subscribe({
                    next: (response) => {
                      console.log('Saved successfully with new status_id:', statusResponse.id);
                      alert('Saved successfully');
                    },
                    error: (err) => {
                      console.error('Save error:', err);
                      alert('Error saving');
                    }
                  });
              },
              error: (err) => {
                console.error('Status creation error:', err);
                alert('Error creating status');
              }
            });
        }
      },
      error: (err) => {
        console.error('Error loading existing data:', err);
        alert('Error loading existing data');
      }
    });
}

  loadData() {
    const patientId = this.orderForm.get('subjectId')?.value;
    const DOS = this.orderForm.get('proposed_administration_date')?.value;

    this.http.get<any>(`http://localhost:3001/api/load-dos-details/${patientId}/${DOS}`).subscribe({
      next: (response) => {
        if (Object.keys(response).length > 0) {
          this.orderForm.patchValue(response);
        }
      },
      error: (error) => {
        console.error('Error loading order:', error);
        alert('Error loading order');
      },
    });
  }
}