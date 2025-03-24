// vial-attest-data.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitDataService } from '../services/visit-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vial-attest-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vial-attest-data.component.html',
  styleUrls: ['./vial-attest-data.component.css']
})
export class VialAttestDataComponent implements OnInit {
  vialForm: FormGroup;
  allChecked = false;
  attestCheckbox = false;
  vialImageUrl: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private visitDataService: VisitDataService,
    private router: Router
  ) {
    this.vialForm = this.fb.group({
      // Form controls for values
      formLabel: [''], // New dropdown control
      studyName: [{value: '', disabled: true}],
      subjectId: [{value: '', disabled: true}],
      lotNumber: [{value: '', disabled: true}],
      manufacturer: [{value: '', disabled: true}],
      rxNumber: [''], // Editable, so no disabled state
      volume: [{value: '', disabled: true}],
      dispAmt: [{value: '', disabled: true}],
      radioNuclide: [{value: '', disabled: true}],
      product: [{value: '', disabled: true}],
      roc: [{value: '', disabled: true}],
      toc: [{value: '', disabled: true}],

      // Checkboxes
      formLabelChecked: [false], // New checkbox for form label
      studyNameChecked: [true],
      subjectIdChecked: [true],
      lotNumberChecked: [true],
      manufacturerChecked: [true],
      rxNumberChecked: [false],
      volumeChecked: [true],
      dispAmtChecked: [true],
      radioNuclideChecked: [true],
      productChecked: [true],
      rocChecked: [true],
      tocChecked: [true]
    });
  }

  ngOnInit() {

    const rxNumber = this.visitDataService.RX;
  console.log('Current RX:', rxNumber);
  
  if (rxNumber) {
    // First get the data with pre-signed URLs
    this.subscription.add(
      this.visitDataService.getVialDataByRx(rxNumber).subscribe(
        data => {
          console.log('API Response with pre-signed URLs:', data);
          console.log('Setting label image URL to:', data.vial_image_url);
          // Make sure to set the image URL before updating the form
          this.vialImageUrl = data.vial_image_url;
          this.visitDataService.setSelectedRxData(data);
        },
        error => console.error('API Error:', error)
      )
    );
  }
    this.visitDataService.selectedRxData$.subscribe(data => {
      if (data) {
        console.log('Received data in Vial:', data);
        this.vialForm.patchValue({
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
          toc: data.calibration_date
        }, { emitEvent: false }); // Prevent infinite loops
      }
    });
    this.subscription.add(
      this.visitDataService.checkboxStates$.subscribe(states => {
        if (states) {
          this.vialForm.patchValue({
            rxNumberChecked: states.rxNumberChecked,       // Add this
            formLabelChecked: states.formLabelChecked        // Add this
          }, { emitEvent: false });
          
          this.attestCheckbox = states.attestCheckbox;
          this.checkAllSelected();
        }
      })
    );

    // Track form label changes
    let previousFormLabel = this.vialForm.get('formLabel')?.value;
    this.vialForm.get('formLabel')?.valueChanges.subscribe(value => {
      if (value !== previousFormLabel) {
        previousFormLabel = value;
        this.visitDataService.updateSelectedRxData({
          form_label: value
        });
      }
    });

    // Track Rx number changes
    let previousRxNumber = this.vialForm.get('rxNumber')?.value;
    this.vialForm.get('rxNumber')?.valueChanges.subscribe(value => {
      if (value !== previousRxNumber) {
        previousRxNumber = value;
        this.visitDataService.updateSelectedRxData({
          rx_number: value
        });
      }
    });

    this.watchCheckboxes();
  }

  watchCheckboxes() {
    this.vialForm.valueChanges.subscribe(() => {
      this.checkAllSelected();
    });
  }

  checkAllSelected() {
    const controls = this.vialForm.controls;
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
    if (this.allChecked) {
      const checkboxStates = {
        rxNumberChecked: this.vialForm.get('rxNumberChecked')?.value,     // Add this
        formLabelChecked: this.vialForm.get('formLabelChecked')?.value,     // Add this
        attestCheckbox: this.attestCheckbox
      };
      this.visitDataService.saveCheckboxStates(checkboxStates);
      this.router.navigate(['/subject-id']);
    }
  }
}