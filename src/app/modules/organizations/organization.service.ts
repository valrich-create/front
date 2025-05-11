import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {Establishment, EstablishmentRequest, EstablishmentUpdateRequest} from "./organization";
import {Page} from "../users/users.models";

@Injectable({
	providedIn: 'root'
})

export class OrganizationService {
	private apiUrl = '/api/establishments';

	constructor(private http: HttpClient) { }

	createEstablishment(request: EstablishmentRequest): Observable<Establishment> {
		return this.http.post<Establishment>(this.apiUrl, request);
	}

	updateEstablishment(id: string, updateRequest: EstablishmentUpdateRequest): Observable<Establishment> {
		return this.http.put<Establishment>(`${this.apiUrl}/${id}`, updateRequest);
	}

	getEstablishmentById(id: string): Observable<Establishment> {
		return this.http.get<Establishment>(`${this.apiUrl}/${id}`);
	}

	getAllEstablishments(page: number = 0, size: number = 20, sort: string = 'nom,asc'): Observable<Page<Establishment>> {
		return this.http.get<Page<Establishment>>(this.apiUrl, {
			params: {
				page: page.toString(),
				size: size.toString(),
				sort
			}
		});
	}

	getAllEstablishmentList(): Observable<Establishment[]> {
		return this.http.get<Establishment[]>(`${this.apiUrl}/list`);
	}

	getEstablishmentsBySuperAdmin(superAdminId: string, page: number = 0, size: number = 20): Observable<Page<Establishment>> {
		return this.http.get<Page<Establishment>>(`${this.apiUrl}/super-admin/${superAdminId}`, {
			params: {
				page: page.toString(),
				size: size.toString()
			}
		});
	}
}

// interface OrganizationsResponse {
//   items: Organization[];
//   total: number;
// }
//
// @Injectable({
//   providedIn: 'root'
// })
// export class OrganizationService {
//   private apiUrl = 'api/organizations';
//
//   // Données fictives pour la démonstration
//   private mockData: Organization[] = [
//     {
//       id: 1,
//       name: 'Beef Steak with Fried Potato',
//       category: 'Lunch',
//       rank: '1',
//       totalOrder: 1456,
//       interest: 26,
//       growth: 5,
//       attendanceRate: 50,
//       userStats: [30, 45, 60, 40, 50]
//     },
//     {
//       id: 2,
//       name: 'Pancake with Honey',
//       category: 'Breakfast',
//       rank: '2',
//       totalOrder: 1456,
//       interest: 26,
//       growth: 2,
//       attendanceRate: 50,
//       userStats: [20, 40, 30, 50, 35]
//     },
//     {
//       id: 3,
//       name: 'Japanese Beef Ramen',
//       category: 'Lunch',
//       rank: '3',
//       totalOrder: 1456,
//       interest: 26,
//       growth: -3,
//       attendanceRate: 50,
//       userStats: [50, 30, 20, 40, 25]
//     },
//     {
//       id: 4,
//       name: 'Mixed Salad',
//       category: 'Lunch',
//       rank: '4',
//       totalOrder: 1456,
//       interest: 26,
//       growth: 0,
//       attendanceRate: 50,
//       userStats: [40, 50, 45, 35, 30]
//     },
//     {
//       id: 5,
//       name: 'Beef Meatball with Vegetable',
//       category: 'Snack',
//       rank: '5',
//       totalOrder: 1456,
//       interest: 26,
//       growth: 8,
//       attendanceRate: 50,
//       userStats: [25, 35, 45, 55, 40]
//     }
//   ];
//
//   constructor(private http: HttpClient) {}
//
//   getOrganizations(timePeriod: string, page: number, limit: number): Observable<OrganizationsResponse> {
//     // En production, on appellerait l'API avec ces paramètres
//     // return this.http.get<OrganizationsResponse>(`${this.apiUrl}?period=${timePeriod}&event-form=${event-form}&limit=${limit}`);
//
//     // Pour la démonstration, on utilise les données fictives
//     return of({
//       items: this.mockData,
//       total: 100
//     });
//   }
//
//   getOrganizationById(id: number): Observable<Organization> {
//     // En production, on appellerait l'API
//     // return this.http.get<Organization>(`${this.apiUrl}/${id}`);
//
//     // Pour la démonstration, on utilise les données fictives
//     return of(this.mockData.find(org => org.id === id) || this.mockData[0]);
//   }
//
//   // Autres méthodes pour créer, mettre à jour ou supprimer des organisations
// }