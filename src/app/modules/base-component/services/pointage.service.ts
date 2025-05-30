import { Injectable } from '@angular/core';
import {
	PeriodType,
	PointageAttemptRequest,
	PointageGlobalStatsResponse,
	PointageResponse,
	PointageStatsResponse, PresenceAbsenceCountResponse,
	PresenceChartDataResponse,
	PresenceStatsResponse,
	UserPresenceRankingResponse,
	ZonePointageResponse
} from "../pointage";
import { Observable } from 'rxjs';
import {HttpClient} from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})
export class PointageService {
	private apiUrl = '/api/pointages';

	constructor(private http: HttpClient) { }

	// Génération des pointages (admin)
	generateTodayPointages(): Observable<string> {
		return this.http.post<string>(`${this.apiUrl}/generate-today`, {});
	}

	// Pointage manuel
	processCheckIn(request: PointageAttemptRequest): Observable<PointageResponse> {
		return this.http.post<PointageResponse>(`${this.apiUrl}/attempt`, request);
	}

	// Récupération des pointages par classe
	getCheckInsByClass(classId: string, period: PeriodType): Observable<PointageResponse[]> {
		return this.http.get<PointageResponse[]>(`${this.apiUrl}/class/${classId}`, {
			params: { period }
		});
	}

	// Récupération des pointages par utilisateur
	getCheckInsByUser(userId: string, period: PeriodType): Observable<PointageResponse[]> {
		return this.http.get<PointageResponse[]>(`${this.apiUrl}/user/${userId}`, {
			params: { period }
		});
	}

	// Statistiques par classe
	getClassStatistics(classId: string, period: PeriodType): Observable<PointageStatsResponse[]> {
		return this.http.get<PointageStatsResponse[]>(`${this.apiUrl}/stats/class/${classId}`, {
			params: { period }
		});
	}

	// Statistiques par établissement
	getEstablishmentStatistics(etablissementId: string, period: PeriodType): Observable<PointageStatsResponse[]> {
		return this.http.get<PointageStatsResponse[]>(`${this.apiUrl}/stats/establishment/${etablissementId}`, {
			params: { period }
		});
	}

	// Statistiques pour tous les établissements
	getAllEstablishmentsStatistics(period: PeriodType): Observable<Record<string, PointageStatsResponse[]>> {
		return this.http.get<Record<string, PointageStatsResponse[]>>(`${this.apiUrl}/stats/establishments`, {
			params: { period }
		});
	}

	// Statistiques globales
	getGlobalStatistics(period: PeriodType): Observable<PointageGlobalStatsResponse> {
		return this.http.get<PointageGlobalStatsResponse>(`${this.apiUrl}/stats/global`, {
			params: { period }
		});
	}

	// Création quotidienne des pointages (admin)
	triggerDailyCreation(): Observable<string> {
		return this.http.post<string>(`${this.apiUrl}/admin/create-daily`, {});
	}

	// Statistiques quotidiennes par classe
	getDailyPresenceStats(classId: string, date: Date): Observable<PresenceStatsResponse> {
		const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
		return this.http.get<PresenceStatsResponse>(`${this.apiUrl}/class/${classId}/stats/daily`, {
			params: { date: dateStr }
		});
	}

	// Classement des utilisateurs par présence
	getUsersPresenceRanking(classId: string, date: Date): Observable<UserPresenceRankingResponse[]> {
		const dateStr = date.toISOString().split('T')[0];
		return this.http.get<UserPresenceRankingResponse[]>(`${this.apiUrl}/class/${classId}/ranking/users`, {
			params: { date: dateStr }
		});
	}

	// Données pour les graphiques
	getPresenceChartData(classId: string, timeFilter: 'today' | 'week' | 'year'): Observable<PresenceChartDataResponse> {
		return this.http.get<PresenceChartDataResponse>(`${this.apiUrl}/class/${classId}/chart`, {
			params: { timeFilter }
		});
	}

	// Zones de pointage
	getClassPointingZones(classId: string): Observable<ZonePointageResponse[]> {
		return this.http.get<ZonePointageResponse[]>(`${this.apiUrl}/class/${classId}/zones`);
	}

	// Métriques globales
	getPresenceAbsenceCounts(classId: string, timeFilter: 'today' | 'week' | 'year'): Observable<PresenceAbsenceCountResponse> {
		return this.http.get<PresenceAbsenceCountResponse>(`${this.apiUrl}/class/${classId}/counts`, {
			params: { timeFilter }
		});
	}
}
