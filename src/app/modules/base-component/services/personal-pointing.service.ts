import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {ZonePointageRequest} from "../../pointing-zone/pointing-zone";
import {PointageResponse, ZonePointageResponse} from "../pointage";
import {PointingHourRequest, PointingHourResponse} from "../../pointing-hour/pointing-hour";

@Injectable({
  providedIn: 'root'
})
export class PersonalPointingService {
  private apiUrl = '/api/pointages';

  constructor(private http: HttpClient) { }

  // Create a personal pointing zone
  createZone(req: ZonePointageRequest): Observable<ZonePointageResponse> {
    return this.http.post<ZonePointageResponse>(`${this.apiUrl}/zone-pointages/personal`, req);
  }

  // Create a personal pointing schedule
  createSchedule(req: PointingHourRequest): Observable<PointingHourResponse> {
    return this.http.post<PointingHourResponse>(`${this.apiUrl}/pointing-hours/personal`, req);
  }

  // Confirm a personal pointing
  confirmPointing(id: string): Observable<PointageResponse> {
    return this.http.patch<PointageResponse>(`${this.apiUrl}/pointages/${id}/confirm`, {});
  }

  // Get personal pointings of the authenticated user
  getPersonalPointingsOfCurrentUser(): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.apiUrl}/pointages/personal/me`);
  }

  // Get personal pointings by user
  getPersonalPointingsOfUser(id: string): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.apiUrl}/pointages/personal/${id}`);
  }

  // Get personal pointings by validator
  getPersonalPointingsByValidator(validatorId: string): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.apiUrl}/pointings/personal/validator/${validatorId}`);
  }

  // Get personal pointings by validator and day
  getPersonalPointingsByValidatorAndDay(validatorId: string, date: string): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.apiUrl}/pointings/personal/validator/${validatorId}/day`, {
      params: { date }
    });
  }

  // Get personal pointings by zone
  getPersonalPointingsByZone(zoneId: string): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.apiUrl}/pointings/personal/zone/${zoneId}`);
  }

  // Get personal pointings by zone and validator
  getPersonalPointingsByZoneAndValidator(zoneId: string, validatorId: string): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.apiUrl}/pointings/personal/zone/${zoneId}/validator/${validatorId}`);
  }

  // Delete a personal pointing
  deletePersonalPointing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pointings/personal/${id}`);
  }
}