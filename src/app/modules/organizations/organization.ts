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