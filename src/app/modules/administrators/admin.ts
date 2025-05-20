import {UserPermission} from "../users/users.models";

export interface Admin {
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: Date;
    placeOfBirth: string;
    profileImageUrl: string;

    role: string;
    permissions: UserPermission[];
    createdAt: string;     // Format: 'yyyy-MM-dd HH:mm:ss'
    updatedAt: string;     // Format: 'yyyy-MM-dd HH:mm:ss'
    lastAccess: string;  // Format: 'yyyy-MM-dd HH:mm:ss'

    // just for nothing
    establishmentName: string;
    classeServiceNom: string;
    classeManagerNom: string;

    pointagesCount?: number;
    pointagesConfirmesCount?: number;
    messagesEnvoyesCount?: number;
    createdEventsCount?: number;
    receivedMessagesCount?: number;
}
