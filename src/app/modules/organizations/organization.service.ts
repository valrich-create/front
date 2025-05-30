import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
	ClassRankingResponse, DailyGlobalStatsResponse,
	Establishment,
	EstablishmentRequest,
	EstablishmentUpdateRequest, TopUserPresenceResponse,
	UserMetricsResponse, WeeklyPresenceStatsResponse,
	YearlyPresenceStatsResponse
} from "./organization";
import {Page} from "../users/users.models";


@Injectable({
	providedIn: 'root'
})

export class OrganizationService {
	private apiUrl = '/api/establishments';

	constructor(private http: HttpClient) { }

	createEstablishment(request: EstablishmentRequest): Observable<Establishment> {
		return this.http.post<Establishment>(this.apiUrl, request);
	}

	updateEstablishment(id: string, updateRequest: EstablishmentUpdateRequest): Observable<Establishment> {
		return this.http.put<Establishment>(`${this.apiUrl}/${id}`, updateRequest);
	}

	getEstablishmentById(id: string): Observable<Establishment> {
		return this.http.get<Establishment>(`${this.apiUrl}/${id}`);
	}

	getAllEstablishments(page: number = 0, size: number = 20, sort: string = 'nom,asc'): Observable<Page<Establishment>> {
		return this.http.get<Page<Establishment>>(this.apiUrl, {
			params: {
				page: page.toString(),
				size: size.toString(),
				sort
			}
		});
	}

	getAllEstablishmentList(): Observable<Establishment[]> {
		return this.http.get<Establishment[]>(`${this.apiUrl}/list`);
	}

	getEstablishmentsBySuperAdmin(superAdminId: string, page: number = 0, size: number = 20): Observable<Page<Establishment>> {
		return this.http.get<Page<Establishment>>(`${this.apiUrl}/super-admin/${superAdminId}`, {
			params: {
				page: page.toString(),
				size: size.toString()
			}
		});
	}


	getUserMetrics(establishmentId: string): Observable<UserMetricsResponse> {
		return this.http.get<UserMetricsResponse>(`${this.apiUrl}/${establishmentId}/metrics/users`);
	}

	getYearlyPresenceStats(establishmentId: string, year: number): Observable<YearlyPresenceStatsResponse> {
		return this.http.get<YearlyPresenceStatsResponse>(`${this.apiUrl}/${establishmentId}/stats-by-year`);
	}

	getWeeklyPresenceStats(establishmentId: string): Observable<WeeklyPresenceStatsResponse> {
		return this.http.get<WeeklyPresenceStatsResponse>(`${this.apiUrl}/${establishmentId}/stats-by-week`);
	}

	getTopPresentUsers(establishmentId: string): Observable<TopUserPresenceResponse[]> {
		return this.http.get<TopUserPresenceResponse[]>(`${this.apiUrl}/${establishmentId}/ranking-users`);
	}

	getClassesRanking(establishmentId: string): Observable<ClassRankingResponse[]> {
		return this.http.get<ClassRankingResponse[]>(`${this.apiUrl}/${establishmentId}/ranking-classes`);
	}

	getDailyGlobalStats(establishmentId: string): Observable<DailyGlobalStatsResponse> {
		return this.http.get<DailyGlobalStatsResponse>(`${this.apiUrl}/${establishmentId}/stats-by-day`);
	}
}
