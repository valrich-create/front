export interface PointingHour {
	id: string;
	startTime: Date;
	time: Date;
	endTime: Date;
	margeMinutes: number;
	createdAt: Date;
	updatedAt: Date;
	classServiceId: string;
	classServiceName: string;
	pointage: any;
}

export interface PointingHourResponse {
	id: string;
	time: Date;
	marge: number;
	startTime: Date;
	endTime: Date;
	classServiceId: string;
	classServiceName: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PointingHourRequest {
	time: Date;
	marge: number;
	classServiceId: string;
}

export interface PointingHourUpdateRequest {
	time: Date;
	marge: number;
}