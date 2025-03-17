import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitData } from '../models/visit-data';

@Injectable({
  providedIn: 'root'
})
export class VisitDataService {
  // Replace this URL with your actual API endpoint
  private apiUrl = 'https://localhost:3001/api/form-data';

  constructor(private http: HttpClient) { }

  getVisitData(): Observable<VisitData[]> {
    return this.http.get<VisitData[]>(this.apiUrl);
  }
}