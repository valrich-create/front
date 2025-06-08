import {Admin} from "../administrators/admin";

export interface Establishment {
    id: string;
    nom: string;
    adresse: string;
    codePostal: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
    logoUrl: string;
    nombreMaxUtilisateurs: number;
    nombreUtilisateursActuels: number;
    createdAt: string;
    updatedAt: string;
    superAdmin: Admin;
}

export interface EstablishmentRequest {
    nom: string;
    adresse: string;
    codePostal: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
    logoUrl: string;
    nombreMaxUtilisateurs: number;
    superAdminId: string;
}

export interface EstablishmentUpdateRequest {
    nom?: string;
    adresse?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
    telephone?: string;
    email?: string;
    logoUrl?: string;
    nombreMaxUtilisateurs?: number;
}


export interface UserMetricsResponse {
    currentUsers: number;
    maxUsers: number;
    adminsCount: number;
    supervisorsCount: number;
    managersCount: number;
}

export interface YearlyPresenceStatsResponse {
    year: number;
    monthlyStats: {
        month: number;
        presenceCount: number;
        absenceCount: number;
    }[];
}

export interface WeeklyPresenceStatsResponse {
    currentWeek: {
        day: string;
        presenceCount: number;
    }[];
    previousWeek: {
        day: string;
        presenceCount: number;
    }[];
    comparisonPercentage: number;
}

export interface TopUserPresenceResponse {
    userId: string;
    userName: string;
    presenceRate: number;
    avatarUrl?: string;
}

export  interface ClassRankingResponse {
    classId: string;
    className: string;
    presenceRate: number;
    studentCount: number;
}

export interface DailyGlobalStatsResponse {
    date: string;
    expectedUsers: number;
    presentUsers: number;
    absenceCount: number;
    presenceRate: number;
}

export interface GlobalStatsResponse {
    totalEstablishments: number;
    totalUsers: number;
    maxCapacity: number;
}

export interface TopEstablishmentByUsersResponse {
    id: string;
    nom: string;
    nombreUtilisateursActuels: number;
}