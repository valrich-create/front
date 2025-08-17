import {PointageStatus, ZonePointageResponse} from "../base-component/pointage";
import {UserResponse} from "../users/users.models";
import {PointingHourResponse} from "../pointing-hour/pointing-hour";

export interface Pointing {
	id: string;
	attemptTime: string;
	latitude: string;
	longitude: string;
	status: PointageStatus,
	confirm: boolean;
	comment: string;
	createdAt: string;
	updatedAt: string;
	user: UserResponse;
	zone: ZonePointageResponse;
	hour: PointingHourResponse;
	confirmBy: UserResponse;
}

export interface PointingResponse {
	id: string;
	userId: string;
	userName: string;
	zoneName: string;
	latitude: number;
	longitude: number;
	pointingHour: Date;
	status: PointageStatus;
	attemptTime: string;
	comment: string;
}
