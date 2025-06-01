import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ClassServiceRequest, ClassServiceResponse, ClassServiceUpdateRequest} from "./class-service";
import {environment} from "../../../environments/environment";
import {Page, UserResponse} from "../users/users.models";

@Injectable({
	providedIn: 'root'
})

export class ClassServiceService {
	private apiUrl = '/api/class-services';

	constructor(private http: HttpClient) { }

	createClassService(request: ClassServiceRequest): Observable<ClassServiceResponse> {
		return this.http.post<ClassServiceResponse>(this.apiUrl, request);
	}

	updateClassService(classId: string, request: ClassServiceUpdateRequest): Observable<ClassServiceResponse> {
		return this.http.put<ClassServiceResponse>(`${this.apiUrl}/${classId}`, request);
	}

	getClassServiceById(classId: string): Observable<ClassServiceResponse> {
		return this.http.get<ClassServiceResponse>(`${this.apiUrl}/${classId}`);
	}

	getAllClassServices(): Observable<ClassServiceResponse[]> {
		return this.http.get<ClassServiceResponse[]>(this.apiUrl);
	}

	getClassServicesByEstablishment(establishmentId: string): Observable<ClassServiceResponse[]> {
		return this.http.get<ClassServiceResponse[]>(`${this.apiUrl}/by-establishment/${establishmentId}`);
	}

	getClassUsers(
		classId: string,
		page: number = 0,
		size: number = 10,
		sortField: string = 'id',
		sortDirection: string = 'asc'
	): Observable<Page<UserResponse>> {
		const params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString())
			.set('sortField', sortField)
			.set('sortDirection', sortDirection);

		return this.http.get<Page<UserResponse>>(`${this.apiUrl}/${classId}/users`, { params });
	}

	// Récupérer le nombre d'utilisateurs d'une classe/service
	getTotalUsersCount(classId: string): Observable<number> {
		return this.http.get<number>(`${this.apiUrl}/${classId}/users/count`);
	}
}
