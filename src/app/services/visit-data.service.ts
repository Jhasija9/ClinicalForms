import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitDataService {
  private baseUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) { }

  // Get infusion visit data
  getFormData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/form-data`);
  }

  // Get study data
  getStudyData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/study-data`);
  }

  // Get combined data
  getCombinedData(): Observable<any> {
    return forkJoin({
      formData: this.getFormData(),
      studyData: this.getStudyData()
    });
  }
}