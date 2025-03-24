// coa-attest-data.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitDataService } from '../services/visit-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coa-attest-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coa-attest-data.component.html',
  styleUrls: ['./coa-attest-data.component.css']
})
export class CoaAttestDataComponent implements OnInit {
  coaForm: FormGroup;
  allChecked = false;
  previousData: any;
  attestCheckbox = false;
  private subscription: Subscription = new Subscription();  // Add this line


  constructor(
    private fb: FormBuilder,
    private visitDataService: VisitDataService,
    private router: Router
  ) {
    this.coaForm = this.fb.group({
      // Form controls for values
      studyName: [{value: '', disabled: true}],
      subjectId: [{value: '', disabled: true}],
      lotNumber: [{value: '', disabled: true}],
      manufacturer: [{value: '', disabled: true}],
      rxNumber: [{value: '', disabled: true}],
      volume: [{value: '', disabled: true}],
      dispAmt: [{value: '', disabled: true}],
      radioNuclide: [{value: '', disabled: true}], // Added this
      product: [{value: '', disabled: true}],      // Added this
      roc: [''],
      toc: [''],

      // Checkboxes
      studyNameChecked: [true],
      subjectIdChecked: [true],
      lotNumberChecked: [true],
      manufacturerChecked: [true],
      rxNumberChecked: [true],
      volumeChecked: [true],
      dispAmtChecked: [true],
      radioNuclideChecked: [true],  // Added this
      productChecked: [true],       // Added this
      rocChecked: [false],
      tocChecked: [false]
    });
  }

  ngOnInit() {
    this.visitDataService.selectedRxData$.subscribe(data => {
      if (data) {
        console.log('Received data in COA:', data);
        // Update all form values at once
        this.coaForm.patchValue({
          studyName: data.Radiopharmaceutical,
          subjectId: data.patient_id,
          lotNumber: data.lot_number,
          manufacturer: data.Manufacturer,
          rxNumber: data.rx_number,
          volume: data.volume,
          dispAmt: data.actual_amount,
          radioNuclide: data.radioNuclide,  // Added this
          product: data.product,            // Added this
          roc: data.radioactivity_concentration,
          toc: data.calibration_date
        }, { emitEvent: false });
      }
    });
    let previousToc = this.coaForm.get('toc')?.value;
  this.coaForm.get('toc')?.valueChanges.subscribe(value => {
    if (value !== previousToc) { // Only update if value actually changed
      previousToc = value;
      this.visitDataService.updateSelectedRxData({
        calibration_date: value
      });
    }
  });
  this.subscription.add(
    this.visitDataService.checkboxStates$.subscribe(states => {
      if (states) {
        this.coaForm.patchValue({
          tocChecked: states.tocChecked,       // Add this
          rocChecked: states.rocChecked        // Add this
        }, { emitEvent: false });
        
        this.attestCheckbox = states.attestCheckbox;
        this.checkAllSelected();
      }
    })
  );
  

  let previousRoc = this.coaForm.get('roc')?.value;
  this.coaForm.get('roc')?.valueChanges.subscribe(value => {
    if (value !== previousRoc) { // Only update if value actually changed
      previousRoc = value;
      this.visitDataService.updateSelectedRxData({
        radioactivity_concentration: value
      });
    }
  });

    this.watchCheckboxes();
  }

  watchCheckboxes() {
    this.coaForm.valueChanges.subscribe(() => {
      this.checkAllSelected();
    });
  }

  checkAllSelected() {
    const controls = this.coaForm.controls;
    this.allChecked = Object.keys(controls)
      .filter(key => key.endsWith('Checked'))
      .every(key => controls[key].value);
  }
  onAttestCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.attestCheckbox = checkbox.checked;
    this.checkAllSelected();
  }

  onAttest() {
    if (this.allChecked) {
      const checkboxStates = {
        tocChecked: this.coaForm.get('tocChecked')?.value,     // Add this
        rocChecked: this.coaForm.get('rocChecked')?.value,     // Add this
        attestCheckbox: this.attestCheckbox
      };
      this.visitDataService.saveCheckboxStates(checkboxStates);
      this.router.navigate(['/vial']);
      console.log('COA Attested:', this.coaForm.value);
      // Handle navigation to next screen
    }

  }
}