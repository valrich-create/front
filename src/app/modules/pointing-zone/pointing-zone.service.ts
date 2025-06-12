import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {
  ZonePointageByClassServiceByEstablishment,
  ZonePointageRequest,
  ZonePointageUpdateRequest
} from "./pointing-zone";
import {ZonePointageResponse} from "../base-component/pointage";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PointingZoneService {
  private apiUrl = '/api/zone-pointages';

  constructor(private http: HttpClient) { }

  /**
   * Create a new attendance zone
   * @param request Zone creation data
   * @returns Created zone details
   */
  createZone(request: ZonePointageRequest): Observable<ZonePointageResponse> {
    return this.http.post<ZonePointageResponse>(this.apiUrl, request);
  }

  /**
   * Update an existing attendance zone
   * @param zoneId ID of the zone to update
   * @param request Zone update data
   * @returns Updated zone details
   */
  updateZone(zoneId: string, request: ZonePointageUpdateRequest): Observable<ZonePointageResponse> {
    return this.http.put<ZonePointageResponse>(`${this.apiUrl}/${zoneId}`, request);
  }

  /**
   * Get details of a specific zone
   * @param zoneId ID of the zone to retrieve
   * @returns Zone details
   */
  getZoneById(zoneId: string): Observable<ZonePointageResponse> {
    return this.http.get<ZonePointageResponse>(`${this.apiUrl}/${zoneId}`);
  }

  /**
   * Get all attendance zones
   * @returns List of all zones
   */
  getAllZones(): Observable<ZonePointageResponse[]> {
    return this.http.get<ZonePointageResponse[]>(this.apiUrl);
  }

  /**
   * Get zones by class/service ID
   * @param classId ID of the class/service
   * @returns List of zones for the specified class/service
   */
  getZonesByClass(classId: string): Observable<ZonePointageResponse[]> {
    return this.http.get<ZonePointageResponse[]>(`${this.apiUrl}/by-class/${classId}`);
  }

  /**
   * Get zones grouped by class/service for an establishment
   * @param establishmentId ID of the establishment
   * @returns Grouped zones data
   */
  getZonesGroupedByClass(establishmentId: string): Observable<ZonePointageByClassServiceByEstablishment> {
    return this.http.get<ZonePointageByClassServiceByEstablishment>(
        `${this.apiUrl}/by-establishment/${establishmentId}/grouped`
    );
  }

  deleteZone(zoneId: string): Observable<any> {}

}
