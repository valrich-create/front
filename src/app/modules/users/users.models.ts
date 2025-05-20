export interface AttendanceRecord {
    date: Date;
    status: 'present' | 'absent' | 'partial';
    hours?: {
        start: string;
        end: string;
        status: 'present' | 'absent' | 'partial';
    }[];
}

export interface Education {
    degree: string;
    institution: string;
    yearFrom: number;
    yearTo: number;
}

export interface CheckInLocation {
    name: string;
    lastCheckIn: Date;
    status: 'active' | 'inactive';
}

export enum ServiceType {
    CUSTOMER_SUPPORT = 'Customer Support',
    TECHNICAL_SUPPORT = 'Technical Support',
    SALES = 'Sales',
    MARKETING = 'Marketing',
    DEVELOPMENT = 'Development',
    HUMAN_RESOURCES = 'Human Resources',
    FINANCE = 'Finance',
    OPERATIONS = 'Operations'
}

export type SortOption = 'createdAt' | 'oldest' | 'age' | 'class';

// users.models.ts

// Enums
export enum UserRole {
    SUPERVISOR = 'SUPERVISOR',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    DEPUTY_DELEGATE = 'DEPUTY_DELEGATE',
    TEACHER = 'TEACHER',
    DELEGATE = 'DELEGATE',
    USER = 'USER',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserPermission {
    CREATE_INFORMATION = 'CREATE_INFORMATION',
    READ_INFORMATION = 'READ_INFORMATION',
    DELETE_INFORMATION = 'DELETE_INFORMATION',

    READ_SERVICES = 'READ_SERVICES',
    CREATE_SERVICE = 'CREATE_SERVICE',
    DELETE_SERVICES = 'DELETE_SERVICES',

    READ_USERS = 'READ_USERS',
    CREATE_USERS = 'CREATE_USERS',
    DELETE_USERS = 'DELETE_USERS',

    READ_ADMINISTRATORS = 'READ_ADMINISTRATORS',
    CREATE_ADMINISTRATORS = 'CREATE_ADMINISTRATORS',
    DELETE_ADMINISTRATORS = 'DELETE_ADMINISTRATORS',
}

// Interfaces principales
export interface UserResponse {
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    permissions: UserPermission[];
    createdAt: string;
    updatedAt: string;
    lastAccess?: string;
    profileImageUrl: string;
    dateOfBirth: string;
    placeOfBirth: string;

    establishmentId?: string;
    establishmentName?: string;

    classeServiceId?: string;
    classeServiceNom?: string;

    classeManagerId?: string;
    classeManagerNom?: string;

    pointagesCount?: number;
    pointagesConfirmesCount?: number;
    messagesEnvoyesCount?: number;
    createdEventsCount?: number;
    receivedMessagesCount?: number;
}

export interface UserRegistrationRequest {
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth: string;
    placeOfBirth: string;
    role?: UserRole;
    permissions?: string[];
    establishmentId: string;
    classeServiceId?: string;
}

export interface UserUpdateRequest {
    lastName?: string;
    firstName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth: string;
    placeOfBirth: string;
    role?: UserRole;
    permissions?: string[];
    classeServiceId?: string;
}

// Pour la pagination
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    last: boolean;
    first: boolean;
}

// // Pour l'entité complète si nécessaire
// export interface UserEntity extends UserResponse {
//     pointages?: Pointage[];
//     pointagesConfirmes?: Pointage[];
//     messagesEnvoyes?: Message[];
//     createdInformations?: Information[];
//     authTokens?: AuthToken[];
//     historiqueConnexions?: ConnexionHistory[];
//     receivedMessages?: DestinataireMessage[];
// }

// Helper type pour le nom complet
export type FullName = Pick<UserResponse, 'firstName' | 'lastName'>;