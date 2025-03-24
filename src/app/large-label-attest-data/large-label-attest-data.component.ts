import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VisitDataService, VialData } from '../services/visit-data.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-large-label-attest-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './large-label-attest-data.component.html',
  styleUrls: ['./large-label-attest-data.component.css']
})
export class LargeLabelAttestDataComponent implements OnInit, OnDestroy {
  labelForm: FormGroup;
  allChecked = false;
  attestCheckbox = false;
  labelImageUrl: string | null = null;
  
  private subscription: Subscription = new Subscription(); // Added explicit type and initialization

  constructor(
    private fb: FormBuilder,
    private visitDataService: VisitDataService,
    private router: Router
  ) {
    // Initialize form with default values to prevent undefined
    this.labelForm = this.fb.group({
      studyName: [''],
      product: [''],
      radioNuclide: [''],
      subjectId: [''],
      manufacturer: [''],
      rxNumber: [''],
      lotNumber: [''],
      volume: [''],
      dispAmt: [''],

      studyNameChecked: [false],
      productChecked: [false],
      radioNuclideChecked: [false],
      subjectIdChecked: [false],
      manufacturerChecked: [false],
      rxNumberChecked: [false],
      lotNumberChecked: [false],
      volumeChecked: [false],
      dispAmtChecked: [false]
    });
  }

  ngOnInit(): void {


  const rxNumber = this.visitDataService.RX;
  console.log('Current RX:', rxNumber);
  
  if (rxNumber) {
    // First get the data with pre-signed URLs
    this.subscription.add(
      this.visitDataService.getVialDataByRx(rxNumber).subscribe(
        data => {
          console.log('API Response with pre-signed URLs:', data);
          console.log('Setting label image URL to:', data.label_image_url);
          // Make sure to set the image URL before updating the form
          this.labelImageUrl = data.label_image_url;
          this.visitDataService.setSelectedRxData(data);
        },
        error => console.error('API Error:', error)
      )
    );
  }
    // Added type safety for service subscription
    this.subscription.add(
      this.visitDataService.selectedRxData$.pipe(
        distinctUntilChanged()
      ).subscribe((data: VialData | null) => {
        if (data) {
          this.labelImageUrl = data.label_image_url || null
          // Added null checks for data properties
          this.labelForm.patchValue({
            studyName: data.Radiopharmaceutical || '',
            rxNumber: data.rx_number || '',
            subjectId: data.patient_id || '',
            lotNumber: data.lot_number || '',
            manufacturer: data.Manufacturer || '',
            volume: data.volume || '',
            dispAmt: data['actual_amount'] || '',
            product: data['product'] || '',           // Added this line
            radioNuclide: data['radio_nuclide'] || '' 
            

          }, { emitEvent: false });
        }
      })
    );
    
    
    this.subscription.add(
      this.visitDataService.checkboxStates$.subscribe(states => {
        if (states) {
          this.labelForm.patchValue({
            studyNameChecked: states.studyNameChecked,
            subjectIdChecked: states.subjectIdChecked,
            manufacturerChecked: states.manufacturerChecked,
            rxNumberChecked: states.rxNumberChecked,
            lotNumberChecked: states.lotNumberChecked,
            volumeChecked: states.volumeChecked,
            dispAmtChecked: states.dispAmtChecked,
            radioNuclideChecked: states.radioNuclideChecked, // Added this line
            productChecked: states.productChecked            // Added this line
          }, { emitEvent: false });
          
          this.attestCheckbox = states.attestCheckbox;
          this.checkAllSelected();
        }
      })
    );

    // Added type safety for form subscription
    this.subscription.add(
      this.labelForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((formValues: any) => { // Added type annotation
        if (formValues) { // Added null check
          this.visitDataService.updateSelectedRxData({
            Radiopharmaceutical: formValues.studyName || '',
            rx_number: formValues.rxNumber || '',
            patient_id: formValues.subjectId || '',
            lot_number: formValues.lotNumber || '',
            Manufacturer: formValues.manufacturer || '',
            volume: formValues.volume || '',
            actual_amount: formValues.dispAmt || '',
            radioNuclide: formValues.radioNuclide || '',
            product: formValues.product || ''
          });
        }
      })
    );
    

    // Added type safety for checkbox subscription
    this.subscription.add(
      this.labelForm.valueChanges.pipe(
        debounceTime(300)
      ).subscribe(() => {
        this.checkAllSelected();
      })
    );
  }

  checkAllSelected(): void { // Added return type
    const controls = this.labelForm.controls;
    if (!controls) return; // Added null check

    const allFieldsChecked = Object.keys(controls)
      .filter(key => key.endsWith('Checked'))
      .every(key => controls[key]?.value === true); // Added safe navigation operator
    
    this.allChecked = allFieldsChecked && this.attestCheckbox;
  }
  handleImageError(event: any): void {
    console.log('Image load error:', this.labelImageUrl);
  }

  onAttestCheckboxChange(event: Event): void { // Added return type
    const checkbox = event.target as HTMLInputElement;
    if (!checkbox) return; // Added null check
    
    this.attestCheckbox = checkbox.checked;
    this.checkAllSelected();
  }

  onAttest(): void { // Added return type
    if (this.allChecked) {
      const checkboxStates = {
        studyNameChecked: this.labelForm.get('studyNameChecked')?.value,
        subjectIdChecked: this.labelForm.get('subjectIdChecked')?.value,
        manufacturerChecked: this.labelForm.get('manufacturerChecked')?.value,
        rxNumberChecked: this.labelForm.get('rxNumberChecked')?.value,
        lotNumberChecked: this.labelForm.get('lotNumberChecked')?.value,
        volumeChecked: this.labelForm.get('volumeChecked')?.value,
        dispAmtChecked: this.labelForm.get('dispAmtChecked')?.value,
        radioNuclideChecked: this.labelForm.get('radioNuclideChecked')?.value, // Added this line
        productChecked: this.labelForm.get('productChecked')?.value,           // Added this line
        attestCheckbox: this.attestCheckbox
      };
      
      this.visitDataService.saveCheckboxStates(checkboxStates);
      this.router.navigate(['/coa']);
    }
  }

  ngOnDestroy(): void { // Added return type
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}