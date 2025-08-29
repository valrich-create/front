import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SubDepartmentRequest, SubDepartmentResponse} from "./department-request";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class SubDepartmentService {
  private apiUrl = '/api/sub-departments';

  constructor(private http: HttpClient) { }

  // Create a new sub-department
  createSubDepartment(request: SubDepartmentRequest): Observable<SubDepartmentResponse> {
    return this.http.post<SubDepartmentResponse>(this.apiUrl, request);
  }

  // Update an existing sub-department
  updateSubDepartment(id: string, request: SubDepartmentRequest): Observable<SubDepartmentResponse> {
    return this.http.put<SubDepartmentResponse>(`${this.apiUrl}/${id}`, request);
  }

  // Delete a sub-department (soft delete)
  deleteSubDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all sub-departments my-establishment
  getAllSubDepartments(): Observable<SubDepartmentResponse[]> {
    return this.http.get<SubDepartmentResponse[]>(this.apiUrl);
  }

  // Get all sub-departments By User connected
  getAllSubDepartmentsByConnectedUser(): Observable<SubDepartmentResponse[]> {
    return this.http.get<SubDepartmentResponse[]>(`${this.apiUrl}/my-establishment`);
  }

  // Get sub-department by ID
  getSubDepartmentById(id: string): Observable<SubDepartmentResponse> {
    return this.http.get<SubDepartmentResponse>(`${this.apiUrl}/${id}`);
  }

  // Get sub-departments by department
  getSubDepartmentsByDepartment(departmentId: string): Observable<SubDepartmentResponse[]> {
    return this.http.get<SubDepartmentResponse[]>(`${this.apiUrl}/department/${departmentId}`);
  }
}
