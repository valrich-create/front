import {Injectable} from '@angular/core';
import {catchError, Observable, of, switchMap, throwError} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {UserService} from "../../users/services/user.service";
import {UserResponse, UserRole} from "../../users/users.models";

@Injectable({
  providedIn: 'root'
})

export class AdministratorServiceService {
  // private apiUrl = '/api/super-admin';
  private apiUrl = '/api/users/super-admin';

  constructor(
      private http: HttpClient,
      private userService: UserService
  ) {}

  getAllAdministratorByEstablishment(
      page: number,
      pageSize: number,
      sort: string,
      search: string
  ): Observable<UserResponse[]> {
    return this.userService.getCurrentUser().pipe(
        switchMap(user => {
          if (user.role === UserRole.SUPER_ADMIN) {
            return this.getUserResponseistrators(page, pageSize, sort, search);
          } else {
            const establishmentId = user.establishmentId;

            return this.userService.getAdvancedUsersByEstablishment(establishmentId).pipe(
                switchMap(pageData => of(pageData.content))
            );
          }
        })
    );
  }

  getAllAdministrators(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}`);
  }

  getUserResponseistrators(page: number, pageSize: number, sort: string, search: string): Observable<UserResponse[]> {
    const params = new HttpParams()
        .set('page', page)
        .set('pageSize', pageSize)
        .set('sort', sort)
        .set('search', search);

    return this.http.get<UserResponse[]>(this.apiUrl, { params });
  }

  getAdministratorById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  // createAdministrator(UserResponse: Partial<UserResponse>): Observable<UserResponse> {
  //   return this.http.post<UserResponse>(`${this.apiUrl}`, UserResponse);
  // }
  //
  // updateAdministrator(id: string, UserResponse: Partial<UserResponse>): Observable<UserResponse> {
  //   return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, UserResponse);
  // }

  createAdministrator(user: Partial<UserResponse>): Observable<UserResponse> {
    const formData = this.buildFormData(user);
    return this.http.post<UserResponse>(this.apiUrl, formData);
  }

  updateAdministrator(id: string, user: Partial<UserResponse>): Observable<UserResponse> {
    const formData = this.buildFormData(user);
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, formData);
  }

  private buildFormData(user: Partial<UserResponse>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(user)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(`${key}[]`, v));
        } else {
          formData.append(key, value as any);
        }
      }
    }

    return formData;
  }

  deleteAdministrator(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCurrentAdmin(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/current-user`)
        .pipe(
            catchError(error => {
              console.error('Error fetching user', error);
              return throwError(() => new Error('Failed to fetch user'));
            })
        );
  }
}