export class Pointage {
}

// Interfaces pour les requêtes
export interface PointageAttemptRequest {
	userId: string;
	pointageId: string;
	attemptTime: Date;
	latitude: number;
	longitude: number;
}

export interface PointageResponse {
	id: string;
	userId: string;
	userName: string;
	status: PointageStatus;
	comment: string;
	attemptTime: Date;
}

export interface PointageStatsResponse {
	date: Date;
	total: number;
	successCount: number;
	failedCount: number;
	successRate: number;
}

export interface PointageGlobalStatsResponse {
	totalPointage: number;
	successCount: number;
	failedCount: number;
	successRate: number;
}

export interface PresenceStatsResponse {
	// date: string;
	presencePercentage: number;
	absencePercentage: number;
}

export interface UserPresenceRankingResponse {
	userId: string;
	userName: string;
	presencePercentage: number;
	absencePercentage: number;
}

export interface PresenceChartDataResponse {
	labels: string[];
	presencePercentages: number[];
	absencePercentages: number[];
	totalPresences: number;
	totalAbsences: number;
}

export interface ZonePointageResponse {
	id: string;
	nom: string;
	latitude: number;
	longitude: number;
	rayonMetres: number;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	establishmentId: string;
	classServiceId: string;
}

export interface PresenceAbsenceCountResponse {
	totalPresences: number;
	totalAbsences: number;
}

export enum PointageStatus {
	CONFIRMED,
	SUCCEED,
	FAILED,
	PENDING
}

export enum PeriodType {
	DAY = 'DAY',
	WEEK = 'WEEK',
	MONTH = 'MONTH',
	YEAR = 'YEAR'
}
