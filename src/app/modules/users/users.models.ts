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

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
    age: number;
    class: string;
    parentName?: string;
    city: string;
    country: string;
    function: 'Délégué' | 'Délégué adjoint' | 'Utilisateur';
    organization: string;
    dateCreated: Date;
    bio?: string;
    education: Education[];
    expertise: string[];
    attendanceRecords?: AttendanceRecord[];
    checkInLocations?: CheckInLocation[];
}

export interface CheckInLocation {
    name: string;
    lastCheckIn: Date;
    status: 'active' | 'inactive';
}

export type SortOption = 'newest' | 'oldest' | 'age' | 'class';