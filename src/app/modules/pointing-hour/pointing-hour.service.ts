import { Injectable } from '@angular/core';
import {Page} from "../users/users.models";
import {Observable} from "rxjs";
import {PointingHourRequest, PointingHourResponse, PointingHourUpdateRequest} from "./pointing-hour";
import {HttpClient, HttpParams} from "@angular/common/http";
import {start} from "node:repl";

@Injectable({
  providedIn: 'root'
})

export class PointingHourService {

  private apiUrl = '/api/pointing-hours';

  constructor(private http: HttpClient) { }

  // Create a new pointing hour
  createPointingHour(request: PointingHourRequest): Observable<PointingHourResponse> {
    return this.http.post<PointingHourResponse>(this.apiUrl, request);
  }

  // Update an existing pointing hour
  updatePointingHour(id: string, request: PointingHourUpdateRequest): Observable<PointingHourResponse> {
    return this.http.put<PointingHourResponse>(`${this.apiUrl}/${id}`, request);
  }

  // Get a pointing hour by ID
  getPointingHourById(id: string): Observable<PointingHourResponse> {
    return this.http.get<PointingHourResponse>(`${this.apiUrl}/${id}`);
  }

  // Get all pointing hours
  getAllPointingHours(): Observable<PointingHourResponse[]> {
    return this.http.get<PointingHourResponse[]>(this.apiUrl);
  }

  // Get pointing hours by class/service ID
  getPointingHoursByClassService(classServiceId: string): Observable<PointingHourResponse[]> {
    return this.http.get<PointingHourResponse[]>(`${this.apiUrl}/by-class-service/${classServiceId}`);
  }

  // Get pointing hours by class/service within time range
  getPointingHoursByClassServiceBetween(classId: string, start: string, end: string): Observable<PointingHourResponse[]> {
    const params = new HttpParams()
        .set('start', start)
        .set('end', end);

    return this.http.get<PointingHourResponse[]>(`${this.apiUrl}/${classId}/by-time-range`, { params });
  }

  // Get pointing hours by user within time range
  getPointingHoursByUserBetween(userId: string, start: string, end: string): Observable<PointingHourResponse[]> {
    const params = new HttpParams()
        .set('start', start)
        .set('end', end);

    return this.http.get<PointingHourResponse[]>(`${this.apiUrl}/${userId}/by-time-range`, { params });
  }

  // Get all pointing hours within time range
  getPointingHoursBetween(start: string, end: string): Observable<PointingHourResponse[]> {
    const params = new HttpParams()
        .set('start', start)
        .set('end', end);

    return this.http.get<PointingHourResponse[]>(`${this.apiUrl}/by-time-range`, { params });
  }

  // Get pointing hours by establishment ID
  getPointingHourByEstablishmentBetween(establishmentId: string, start: string, end: string): Observable<PointingHourResponse[]> {
    const params = new HttpParams()
        .set('start', start)
        .set('end', end);

    return this.http.get<PointingHourResponse[]>(`${this.apiUrl}/${establishmentId}/by-time-range`, { params });
  }

  getPointingHourByEstablishmentBetweenForConnectedUser(start: string, end: string): Observable<PointingHourResponse[]> {
    const params = new HttpParams()
        .set('start', start)
        .set('end', end);

    return this.http.get<PointingHourResponse[]>(`${this.apiUrl}/establishment/by-time-range`, { params });
  }

  deleteHorairePointage(hourId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${hourId}`);
  }

  // Get paginated pointing hours
  getAllPointingHoursPaginated(
      page: number = 0,
      size: number = 10,
      sort: string = 'id,asc'
  ): Observable<Page<PointingHourResponse>> {
    const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('sort', sort);

    return this.http.get<Page<PointingHourResponse>>(`${this.apiUrl}/paginated`, { params });
  }

}
