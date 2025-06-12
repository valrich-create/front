import {Injectable} from '@angular/core';
import {Admin} from "../admin";
import {Observable, of, switchMap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {UserService} from "../../users/services/user.service";
import {UserResponse, UserRole} from "../../users/users.models";

@Injectable({
  providedIn: 'root'
})

export class AdministratorServiceService {
  private apiUrl = '/api/super-admin';

  constructor(
      private http: HttpClient,
      private userService: UserService
  ) {}

  getAllAdministratorsOrAdvancedUsers(
      page: number,
      pageSize: number,
      sort: string,
      search: string
  ): Observable<Admin[] | UserResponse[]> {
    return this.userService.getCurrentUser().pipe(
        switchMap(user => {
          if (user.role === UserRole.SUPER_ADMIN) {
            return this.getAdministrators(page, pageSize, sort, search);
          } else {
            const establishmentId = user.establishmentId;

            return this.userService.getAdvancedUsersByEstablishment(establishmentId).pipe(
                switchMap(pageData => of(pageData.content))
            );
          }
        })
    );
  }

  getAllAdministrators(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}`);
  }

  getAdministrators(page: number, pageSize: number, sort: string, search: string): Observable<Admin[]> {
    const params = new HttpParams()
        .set('page', page)
        .set('pageSize', pageSize)
        .set('sort', sort)
        .set('search', search);

    return this.http.get<Admin[]>(this.apiUrl, { params });
  }

  getAdministratorById(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/${id}`);
  }

  createAdministrator(admin: Partial<Admin>): Observable<Admin> {
    return this.http.post<Admin>(`${this.apiUrl}`, admin);
  }

  updateAdministrator(id: string, admin: Partial<Admin>): Observable<Admin> {
    return this.http.put<Admin>(`${this.apiUrl}/${id}`, admin);
  }

  deleteAdministrator(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}