export interface PointingHour {
	id: string;
	startTime: Date;
	time: Date;
	endTime: Date;
	margeMinutes: number;
	createdAt: Date;
	updatedAt: Date;
	classServiceId: string;
	userId: string;
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
	userId: string;
	userFirstName: string;
	userLastName: string;
	validatorId: string;
	validatorFistName: string;
	validatorLastName: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PointingHourRequest {
	startTime: Date;
	marge: number;
	endTime: Date;
	classServiceId: string;
	userId: string;
	validatorId: string;
}

export interface PointingHourUpdateRequest {
	startTime: Date;
	marge: number;
	endTime: Date;
}