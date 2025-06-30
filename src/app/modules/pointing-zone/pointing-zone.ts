import {ZonePointageResponse} from "../base-component/pointage";

export interface ZonePointageByClassServiceByEstablishment {
	etablissementId: string;
	etablissementNom: string;
	zonesParClasse: Map<ClassServiceInfo, ZonePointageResponse[]>;
	nombreZonesParClasse: Map<ClassServiceInfo, number>;
}


export interface ClassServiceInfo {
	id: string;
	nom: string;
}

export interface ZonePointageRequest {
	nom: string;
	latitude: number;
	longitude: number;
	rayonMetres: number;
	description: string;
	etablissementId: string;
	classeServiceId: string;
}

export interface ZonePointageUpdateRequest {
	nom: string;
	latitude: number;
	longitude: number;
	rayonMetres: number;
	description: string;
	classServiceId: string;
}