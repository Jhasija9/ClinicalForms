import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
// import { Injectable } from '@angular/core';


export interface RxRecord {
  Radiopharmaceutical: string;
  rx_number: string;
  patient_id: string;
  actual_amount: string;
  calibration_date: string;
  lot_number: string;
  Manufacturer: string;
  volume: string;
  radioactivity_concentration: string;
  product: string;
  radio_nuclide: string;
  form_label: string;
  attest_by: string;
  // status: string;
}

export interface VialData {
  rx_number: string;
  Radiopharmaceutical: string;
  patient_id?: string;
  lot_number?: string;
  Manufacturer?: string;
  volume?: string;
  final_amount?: string;
  label_image_url: string;
  coa_image_url: string;
  vial_image_url: string;
  [key: string]: any; // For any additional properties
}


@Injectable({
  providedIn: 'root',
})
export class VisitDataService {
  private baseUrl = 'http://localhost:3001/api';
  currentPatientID = "";
  RX = "";
  DOB ="";
  PtientName="";
  Radio=""
  SyringeId="";
  volume="";
  DOS="";



  private selectedRxData = new BehaviorSubject<any>(null);
  selectedRxData$ = this.selectedRxData.asObservable();
  private checkboxStates = new BehaviorSubject<any>(null);
  checkboxStates$ = this.checkboxStates.asObservable();

  RWFormGroup =  FormGroup;
  CalFormGroup = FormGroup;
  constructor(private http: HttpClient) {}


  setSelectedRxData(data: any) {
    this.selectedRxData.next(data);
    // Update existing properties
    this.RX = data.rx_number;
    this.Radio = data.Radiopharmaceutical;
    this.volume = data.volume;
  }
  updateSelectedRxData(updatedData: Partial<VialData>) {
    console.log('Current service data:', this.selectedRxData.value);
    const currentData = this.selectedRxData.getValue();
    if (currentData) {
      // Merge current data with updates
      const newData = {
        ...currentData,
        ...updatedData
      };
      this.selectedRxData.next(newData);
    }
  }
  saveCheckboxStates(states: any) {
    this.checkboxStates.next(states);
  }

  // Get infusion visit data
  getFormData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/form-data`);
  }

  // Get study data
  getStudyData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/study-data`);
  }

  getVialData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vial-data`);
  }
  getVialDataByRx(rxNumber: string): Observable<VialData> {
    // Simply return the data from backend - URLs will already be pre-signed
    return this.http.get<VialData>(`${this.baseUrl}/vial-data/${rxNumber}`);
  }
  

  // Get combined data
  getCombinedData(): Observable<any> {
    return forkJoin({
      formData: this.getFormData(),
      studyData: this.getStudyData(),
    });
  }
  updateAttestation(rxNumber: string, formData: any): Observable<any> {
    const updateData = {
      Radiopharmaceutical: formData.studyName,
      patient_id: formData.subjectId,
      actual_amount: formData.dispAmt,
      lot_number: formData.lotNumber,
      Manufacturer: formData.manufacturer,
      volume: formData.volume,
      product: formData.product,
      radio_nuclide: formData.radioNuclide,
      form_label: formData.formLabel,
      calibration_date: formData.toc,
      radioactivity_concentration: formData.roc,
      status: 'attested',
    };
    
    console.log('Sending update data:', updateData); // Debug log
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put(`${this.baseUrl}/update-attestation/${rxNumber}`, updateData,{headers});
  }
}
