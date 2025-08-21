import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EventService {
  private apiUrl = `/api/information`;

  constructor(private http: HttpClient) {}

  createInformation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  getInformationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAllInformations(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getInformationsByEstablishment(establishmentId: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/establishment/${establishmentId}?page=${page}&size=${size}`);
  }

  getInformationsByEstablishmentForConnectedUser(page: number = 0, size: number = 100): Observable<any> {
    return this.http.get(`${this.apiUrl}/establishment/?page=${page}&size=${size}`);
  }

  getCurrentUserInformations(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-informations?page=${page}&size=${size}`);
  }

  updateInformation(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteInformation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  softDeleteInformation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/soft/${id}`);
  }

  countByEstablishment(establishmentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/count/establishment/${establishmentId}`);
  }

  getLatestInformations(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/latest?limit=${limit}`);
  }

  /**
   * Génère une couleur aléatoire pour un nouvel événement
   */
  generateRandomColor(): string {
    const colors = [
      '#FF6347', // Tomato
      '#4169E1', // Royal Blue
      '#32CD32', // Lime Green
      '#FFD700', // Gold
      '#9370DB', // Medium Purple
      '#20B2AA', // Light Sea Green
      '#FF69B4', // Hot Pink
      '#FF4500'  // Orange Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getEventsForDay(date: Date) {
    return [];
  }
}