// event.model.ts
export interface Events {
    id: number;
    title: string;
    category: string;
    startTime: Date;
    endTime: Date;
    color: string;
    attendees?: Attendee[];
    description?: string;
    location?: string;
}

export interface Attendee {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
}

