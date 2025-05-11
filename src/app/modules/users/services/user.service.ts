import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, switchMap, throwError} from "rxjs";
import {Page, SortOption, UserRegistrationRequest, UserResponse, UserRole, UserUpdateRequest} from "../users.models";
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})

export class UserService {
	// private apiUrl = '/users';
	private apiUrl = '/api/users';
	private selectedUsersSubject = new BehaviorSubject<string[]>([]);
	selectedUsers$ = this.selectedUsersSubject.asObservable();

	constructor(private http: HttpClient) { }

	createUser(request: UserRegistrationRequest): Observable<UserResponse> {
		return this.http.post<UserResponse>(this.apiUrl, request);
		// return this.http.post<UserResponse>(this.apiUrl, userData);
	}

	getUsersByRoleAndEstablishment(page: number = 0, size: number = 20, sort: string = 'lastName'): Observable<Page<UserResponse>> {
		return this.getCurrentUser().pipe(
			switchMap(user => {
				const establishmentId = user.establishmentId;
				if (!establishmentId) {
					return throwError(() => new Error('No establishment associated with current user'));
				}

				if (user.role === UserRole.SUPER_ADMIN) {
					return this.getAdvancedUsersByEstablishment(establishmentId, page, size, sort);
				} else {
					return this.getBasicUsersByEstablishment(establishmentId, page, size, sort);
				}
			}),
			catchError(error => {
				console.error('Error determining user role or fetching users', error);
				return throwError(() => new Error('Failed to fetch users by role'));
			})
		);
	}

	getUserById(userId: string): Observable<UserResponse> {
		return this.http.get<UserResponse>(`${this.apiUrl}/${userId}`)
			.pipe(
				catchError(error => {
					console.error('Error fetching user', error);
					return throwError(() => new Error('Failed to fetch user'));
				})
			);
	}

	getAllUsers(page: number = 0, size: number = 20, sort: string = 'lastName'): Observable<Page<UserResponse>> {
		const params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString())
			.set('sort', sort);

		return this.http.get<Page<UserResponse>>(this.apiUrl, { params })
			.pipe(
				catchError(error => {
					console.error('Error Getting all users', error);
					return throwError(() => new Error('Failed to Get users'));
				})
			);
	}

	getBasicUsersByEstablishment(establishmentId: string, page: number = 0, size: number = 20, sort: string = 'lastName'): Observable<Page<UserResponse>> {
		const params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString())
			.set('sort', sort);

		return this.http.get<Page<UserResponse>>(`${this.apiUrl}/basic/${establishmentId}`, { params })
			.pipe(
				catchError(error => {
					console.error('Error getting basic users by establishment', error);
					return throwError(() => new Error('Failed to get basic users by establishment'));
				})
			);
	}

	getAdvancedUsersByEstablishment(establishmentId: string | undefined, page: number = 0, size: number = 20, sort: string = 'lastName'): Observable<Page<UserResponse>> {
		const params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString())
			.set('sort', sort);

		return this.http.get<Page<UserResponse>>(`${this.apiUrl}/advanced/${establishmentId}`, { params })
			.pipe(
				catchError(error => {
					console.error('Error getting advanced users by establishment', error);
					return throwError(() => new Error('Failed to get advanced users by establishment'));
				})
			);
	}

	getUsersByClassId(classId: string, page: number = 0, size: number = 20): Observable<Page<UserResponse>> {
		const params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString());

		return this.http.get<Page<UserResponse>>(`${this.apiUrl}/by-class/${classId}`, { params })
			.pipe(
				catchError(error => {
					console.error('Error Getting all users', error);
					return throwError(() => new Error('Failed to Get users'));
				})
			);
	}

	getUsersByEstablishmentId(establishmentId: string, page: number = 0, size: number = 20): Observable<Page<UserResponse>> {
		const params = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString());

		return this.http.get<Page<UserResponse>>(`${this.apiUrl}/by-establishment/${establishmentId}`, { params })
			.pipe(
				catchError(error => {
					console.error('Error Getting all users', error);
					return throwError(() => new Error('Failed to Get users'));
				})
			);
	}

	updateUser(userId: string, request: UserUpdateRequest): Observable<UserResponse> {
		return this.http.put<UserResponse>(`${this.apiUrl}/${userId}`, request)
			.pipe(
				catchError(error => {
					console.error('Error try later', error);
					return throwError(() => new Error('Failures'));
				})
			);
	}

	addUserToClassService(userId: string, classId: string): Observable<UserResponse> {
		return this.http.put<UserResponse>(`${this.apiUrl}/${userId}/assign-class/${classId}`, {})
			.pipe(
				catchError(error => {
					console.error('Error try later', error);
					return throwError(() => new Error('Failures'));
				})
			);
	}

	addUserToEstablishment(userId: string, establishmentId: string): Observable<UserResponse> {
		return this.http.put<UserResponse>(`${this.apiUrl}/${userId}/assign-establishment/${establishmentId}`, {})
			.pipe(
				catchError(error => {
					console.error('Error try later', error);
					return throwError(() => new Error('Failures'));
				})
			);
	}

	deleteUser(userId: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${userId}`)
			.pipe(
				catchError(error => {
					console.error('Error try later', error);
					return throwError(() => new Error('Failures'));
				})
			);
	}

	getCurrentUser(): Observable<UserResponse> {
		return this.http.get<UserResponse>(`${this.apiUrl}/current-user`)
			.pipe(
				catchError(error => {
					console.error('Error fetching user', error);
					return throwError(() => new Error('Failed to fetch user'));
				})
			);
	}

	getCurrentUserId(): Observable<{ userId: string }> {
		return this.http.get<{ userId: string }>(`${this.apiUrl}/current-user-id`)
			.pipe(
				catchError(error => {
					console.error('Error fetching user', error);
					return throwError(() => new Error('Failed to fetch user'));
				})
			);
	}

	toggleUserSelection(userId: string): void {
		const currentSelection = this.selectedUsersSubject.value;
		if (currentSelection.includes(userId)) {
			this.selectedUsersSubject.next(currentSelection.filter(id => id !== userId));
		} else {
			this.selectedUsersSubject.next([...currentSelection, userId]);
		}
	}

	clearSelection(): void {
		this.selectedUsersSubject.next([]);
	}

	private sortUsers(users: UserResponse[], sortBy: SortOption): UserResponse[] {
		return [...users].sort((a, b) => {
			switch (sortBy) {
				case 'createdAt':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case 'oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				// case 'age':
				//   return a.age - b.age;
				// case 'class':
				//   return a.class.localeCompare(b.class);
				default:
					return 0;
			}
		});
	}
}