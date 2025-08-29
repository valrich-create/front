import {Establishment} from "../organizations/organization";

export interface ClassServiceRequest {
	nom: string;
	description?: string;
	establishmentId: string;
	departmentId: string;
	subDepartmentId: string;
	thirdLevelDepartmentId: string;
}

export interface ClassServiceUpdateRequest {
	nom?: string;
	description?: string;
	departmentId: string;
	subDepartmentId: string;
	thirdLevelDepartmentId: string;
}

export interface ClassServiceResponse {
	id: string;
	nom: string;
	description?: string;
	createdAt: string;
	updatedAt?: string;
	deletedAt?: string;
	establishment?: Establishment;
	departmentId: string;
	subDepartmentId: string;
	thirdLevelDepartmentId: string;
	utilisateursCount: number;
	managersCount: number;
	zonePointage: any[];
	horairesPointageCount: number;
	messagesRecusCount: number;
}