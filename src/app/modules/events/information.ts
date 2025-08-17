import {Establishment} from "../organizations/organization";
import {UserResponse} from "../users/users.models";

export interface InformationRequest {
    title: string;
    description: string;
    establishmentId: string;
    isImportant?: boolean;
    importanceDisplayStartDate?: Date | null;
    importanceDisplayEndDate?: Date | null;
}

export interface InformationResponse {
    id: string;
    title: string;
    description: string;
    isImportant?: boolean;
    importanceDisplayStartDate?: Date | null;
    importanceDisplayEndDate?: Date | null;
    importanceInformationTarget?: string[];
    fileUrls?: string[];
    createdBy: string;
    createdByName: string;
    establishmentId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export interface Information {
    id: string;
    title: string;
    description: string;
    isImportant: boolean;
    importanceDisplayStartDate?: Date | null;
    importanceDisplayEndDate?: Date | null;
    importanceInformationTarget?: string[];
    file?: File | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    establishment: Establishment;
    createdBy: UserResponse;
}

export interface File {
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    fileAuthor: UserResponse;
}
