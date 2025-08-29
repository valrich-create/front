import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DepartmentRequest, DepartmentResponse} from "./department-request";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class DepartmentService {
  private apiUrl = '/api/departments';

  constructor(private http: HttpClient) { }

  // Create a new department
  createDepartment(request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(this.apiUrl, request);
  }

  // Update an existing department
  updateDepartment(id: string, request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.apiUrl}/${id}`, request);
  }

  // Delete a department (soft delete)
  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all departments
  getAllMyDepartments(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(`${this.apiUrl}/my-establishment`);
  }

  // Get department by ID
  getDepartmentById(id: string): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.apiUrl}/${id}`);
  }

  // Get departments by establishment
  getDepartmentsByEstablishment(establishmentId: string): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(`${this.apiUrl}/establishment/${establishmentId}`);
  }
}
