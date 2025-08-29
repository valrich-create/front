import { Injectable } from '@angular/core';
import {SubDepartmentResponse, ThirdLevelDepartmentRequest, ThirdLevelDepartmentResponse} from "./department-request";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class ThirdLevelDepartmentService {
  private apiUrl = '/api/third-departments';

  constructor(private http: HttpClient) { }

  // Create a new third-level department
  createThirdLevelDepartment(request: ThirdLevelDepartmentRequest): Observable<ThirdLevelDepartmentResponse> {
    return this.http.post<ThirdLevelDepartmentResponse>(this.apiUrl, request);
  }

  // Update an existing third-level department
  updateThirdLevelDepartment(id: string, request: ThirdLevelDepartmentRequest): Observable<ThirdLevelDepartmentResponse> {
    return this.http.put<ThirdLevelDepartmentResponse>(`${this.apiUrl}/${id}`, request);
  }

  // Delete a third-level department (soft delete)
  deleteThirdLevelDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all third-level departments
  getAllThirdLevelDepartments(): Observable<ThirdLevelDepartmentResponse[]> {
    return this.http.get<ThirdLevelDepartmentResponse[]>(this.apiUrl);
  }

  // Get all third-level-departments By User connected
  getAllThirdLevelDepartmentsByConnectedUser(): Observable<ThirdLevelDepartmentResponse[]> {
    return this.http.get<ThirdLevelDepartmentResponse[]>(`${this.apiUrl}/my-establishment`);
  }

  // Get third-level department by ID
  getThirdLevelDepartmentById(id: string): Observable<ThirdLevelDepartmentResponse> {
    return this.http.get<ThirdLevelDepartmentResponse>(`${this.apiUrl}/${id}`);
  }

  // Get third-level departments by sub-department
  getThirdLevelDepartmentsBySubDepartment(subDepartmentId: string): Observable<ThirdLevelDepartmentResponse[]> {
    return this.http.get<ThirdLevelDepartmentResponse[]>(`${this.apiUrl}/sub-department/${subDepartmentId}`);
  }
}
