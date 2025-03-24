// subject-id.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitDataService } from '../services/visit-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
// import { Event } from '@angular/router';
import { RxRecord } from '../services/visit-data.service';  

interface PatientRecord { 
  patient_id: string;
  // patient_name: string;
  // columns of df db
}

@Component({
  selector: 'app-subject-id',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './subject-id.component.html',
  styleUrls: ['./subject-id.component.css']
})
export class SubjectIdComponent implements OnInit, OnDestroy {
  subjectForm: FormGroup;
  allChecked = false;
  attestCheckbox = false;
  private subscription = new Subscription();
  subjectIdFromLabel: string = ''; // Add this property declaration
  patientRecords: any[] = []; // To store the records from API
  selectedPatientRecord: PatientRecord | null = null;
  showMessage = false;
  successMessage = '';
  matchStatus: 'matches' | 'noMatches' | null = null;  // To store selected patient


  constructor(
    private fb: FormBuilder,
    private visitDataService: VisitDataService,
    private router: Router
  ) {
    this.subjectForm = this.fb.group({
      // Form controls for values - all disabled
      patientIdControl: [null],  // ADD this line
      formLabel: [{value: '', disabled: true}],
      studyName: [{value: '', disabled: true}],
      subjectId: [{value: '', disabled: true}],
      lotNumber: [{value: '', disabled: true}],
      manufacturer: [{value: '', disabled: true}],
      rxNumber: [{value: '', disabled: true}],
      volume: [{value: '', disabled: true}],
      dispAmt: [{value: '', disabled: true}],
      radioNuclide: [{value: '', disabled: true}],
      product: [{value: '', disabled: true}],
      roc: [{value: '', disabled: true}],
      toc: [{value: '', disabled: true}],
      

      // Checkboxes
      formLabelChecked: [true],
      studyNameChecked: [true],
      subjectIdChecked: [true],
      lotNumberChecked: [true],
      manufacturerChecked: [true],
      rxNumberChecked: [true],
      volumeChecked: [true],
      dispAmtChecked: [true],
      radioNuclideChecked: [true],
      productChecked: [true],
      rocChecked: [true],
      tocChecked: [true]
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.visitDataService.selectedRxData$.subscribe(data => {
        if (data) {
          console.log('Received data in Subject ID:', data);
          this.subjectIdFromLabel = data.patient_id || '';
          this.subjectForm.patchValue({
            formLabel: data.form_label || '',
            studyName: data.Radiopharmaceutical,
            subjectId: data.patient_id,
            lotNumber: data.lot_number,
            manufacturer: data.Manufacturer,
            rxNumber: data.rx_number,
            volume: data.volume,
            dispAmt: data.actual_amount,
            radioNuclide: data.radioNuclide,
            product: data.product,
            roc: data.radioactivity_concentration,
            toc: data.calibration_date,
            patientIdControl: data.patient_id // Add this line
          }, { emitEvent: false });
          this.compareIds(data.patient_id);
        }
      })
    );
    this.subscription.add(
      this.visitDataService.getFormData().subscribe({
        next: (data: PatientRecord[]) => {
          this.patientRecords = data;
          console.log('Loaded patient records:', data);
        },
        error: (error) => {
          console.error('Error loading records:', error);
        }
      })
    );
    this.subscription.add(
      this.subjectForm.get('patientIdControl')?.valueChanges.subscribe(selectedId => {
        this.compareIds(selectedId);
      })
    );

    this.watchCheckboxes();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  

  watchCheckboxes() {
    this.subscription.add(
      this.subjectForm.valueChanges.subscribe(() => {
        this.checkAllSelected();
      })
    );
  }
  private compareIds(selectedId: string | null) {
    if (!selectedId || !this.subjectIdFromLabel) {
      this.matchStatus = null;
      return;
    }
  
    // Normalize both strings by:
    // 1. Remove all spaces
    // 2. Convert to lowercase
    // 3. Replace all types of dashes with a standard dash
    const normalizeString = (str: string): string => {
      return str
        .replace(/\s+/g, '')        // Remove all spaces
        .toLowerCase()              // Convert to lowercase
        .replace(/[\-–—]/g, '-');   // Standardize dashes
    };
  
    const normalizedSelected = normalizeString(String(selectedId));
    const normalizedLabel = normalizeString(String(this.subjectIdFromLabel));
  
    console.log('Comparing IDs:', {
      label: normalizedLabel,
      labelOriginal: this.subjectIdFromLabel,
      selected: normalizedSelected,
      selectedOriginal: selectedId
    });
  
    this.matchStatus = normalizedSelected === normalizedLabel ? 'matches' : 'noMatches';
  }  checkAllSelected() {
    const controls = this.subjectForm.controls;
    const allFieldsChecked = Object.keys(controls)
      .filter(key => key.endsWith('Checked'))
      .every(key => controls[key].value);
    
    this.allChecked = allFieldsChecked && this.attestCheckbox;
  }

  onAttestCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.attestCheckbox = checkbox.checked;
    this.checkAllSelected();
  }

  onAttest() {
    if (this.canAttest()) {
      const rxNumber = this.subjectForm.get('rxNumber')?.value;
      
      // console.log('Attesting RX:', rxNumber); // Debug log
      console.log('Form Values:', this.subjectForm.value);
    console.log('RX Number:', rxNumber);
      
      if (!rxNumber) {
        console.error('No RX number found');
        return;
      }
  
      // Get all form values
      const formValues = {
        studyName: this.subjectForm.get('studyName')?.value,
        subjectId: this.subjectForm.get('subjectId')?.value,
        dispAmt: this.subjectForm.get('dispAmt')?.value,
        lotNumber: this.subjectForm.get('lotNumber')?.value,
        manufacturer: this.subjectForm.get('manufacturer')?.value,
        volume: this.subjectForm.get('volume')?.value,
        product: this.subjectForm.get('product')?.value,
        radioNuclide: this.subjectForm.get('radioNuclide')?.value,
        formLabel: this.subjectForm.get('formLabel')?.value,
        toc: this.subjectForm.get('toc')?.value,
        roc: this.subjectForm.get('roc')?.value,
        status:'attested'
      };
      console.log('Sending form values:', formValues); // Debug log

  
      this.visitDataService.updateAttestation(rxNumber, formValues).subscribe({
        next: (response) => {
          console.log('Attestation updated successfully', response);
          // this.router.navigate(['/next-page']);
          this.successMessage = 'Subject ID verified successfully';
          this.showMessage = true;
          
          // Hide message and navigate after 2 seconds
          setTimeout(() => {
            this.showMessage = false;
            this.router.navigate(['/next-page']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error updating attestation:', error);
          this.successMessage = 'Error verifying Subject ID';
          this.showMessage = true;
          
          setTimeout(() => {
            this.showMessage = false;
          }, 2000);
        }
      });
    }
  }

  onMatchesClick() {
    this.matchStatus = 'matches';
    console.log('Matches button clicked');
  }
  
  // Update your existing onNoMatchesClick method
  onNoMatchesClick() {
    this.matchStatus = 'noMatches';
    console.log('No Matches button clicked');
  }
  onPatientSelect(event: any): void {
    const selectedId = this.subjectForm.get('patientIdControl')?.value;
    this.compareIds(selectedId);
  }
  canAttest(): boolean {
    const controls = this.subjectForm.controls;
    const allFieldsChecked = Object.keys(controls)
      .filter(key => key.endsWith('Checked'))
      .every(key => controls[key].value);
    
    return this.matchStatus === 'matches' && // Only allow attest if IDs match
           allFieldsChecked && 
           this.attestCheckbox;
  }
  
}
