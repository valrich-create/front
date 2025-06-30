import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {environment} from "../../../../environments/environment";

interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		phoneNumber: string;
		email: string;
		name: string;
		role: string;
	};
}

interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly TOKEN_KEY = 'accessToken';
	private readonly AUTH_REFRESH_TOKEN = 'refreshToken';
	private readonly USER_KEY = 'user_data';
	private readonly API_URL = `${environment.apiUrl}/v1/auth`;

	constructor(private http: HttpClient) {}

	login(phoneNumber: string, password: string, rememberMe: boolean): Observable<AuthResponse> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		});

		console.log('Sending request with:', { phoneNumber, password });

		return this.http.post<AuthResponse>(
			`${this.API_URL}/authenticate`,
			{ phoneNumber, password },
			{ headers }
		).pipe(
			tap(response => {
				console.log('Full response:', response);
				this.storeAuthData(response, rememberMe);
			}),
			catchError(error => {
				console.error('Full error:', error);
				if (error.error instanceof ErrorEvent) {
					console.error('Client-side error:', error.error.message);
				} else {
					console.error(`Backend returned code ${error.status}, body was:`, error.error);
				}
				return throwError(() => new Error('Login failed'));
			})
		);
	}

	logout(): Observable<any> {
		// Optionally call logout endpoint to invalidate token on server
		const logout$ = this.http.post(`${this.API_URL}/logout`, {})
			.pipe(
				catchError(() => {
					// Even if server logout fails, clear local storage
					return of(null);
				})
			);

		return logout$.pipe(
			tap(() => {
				localStorage.removeItem(this.TOKEN_KEY);
				localStorage.removeItem(this.USER_KEY);
				sessionStorage.removeItem(this.TOKEN_KEY);
				sessionStorage.removeItem(this.USER_KEY);
			})
		);
	}

	changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<any> {
		// Vérification côté client que les nouveaux mots de passe correspondent
		if (newPassword !== confirmNewPassword) {
			return throwError(() => new Error('Les nouveaux mots de passe ne correspondent pas'));
		}

		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': `Bearer ${this.getToken()}`
		});

		const payload: ChangePasswordRequest = {
			currentPassword,
			newPassword,
			confirmNewPassword
		};

		return this.http.post(
			`${this.API_URL}/change-password`,
			payload,
			{ headers }
		).pipe(
			tap(() => {
				console.log('Password changed successfully');
				// Optionnel : Déconnecter l'utilisateur après changement de mot de passe
				// this.logout().subscribe();
			}),
			catchError(error => {
				console.error('Password change error:', error);
				let errorMessage = 'Une erreur est survenue lors du changement de mot de passe';

				if (error.status === 401) {
					errorMessage = 'Mot de passe actuel incorrect';
				} else if (error.status === 400) {
					errorMessage = error.error?.message || 'Requête invalide';
				}

				return throwError(() => new Error(errorMessage));
			})
		);
	}

	isLoggedIn(): boolean {
		return !!this.getToken();
	}

	getToken(): string | null {
		return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
	}

	getUser(): any {
		const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
		return userStr ? JSON.parse(userStr) : null;
	}

	getUserRole(): string | null {
		const user = this.getUser();
		return user?.role ?? null;
	}

	private storeAuthData(authData: AuthResponse, rememberMe: boolean): void {
		const storage = rememberMe ? localStorage : sessionStorage;
		storage.setItem(this.TOKEN_KEY, authData.accessToken);
		storage.setItem(this.USER_KEY, authData.refreshToken);
		storage.setItem(this.AUTH_REFRESH_TOKEN, authData.refreshToken);
		storage.setItem(this.USER_KEY, JSON.stringify(authData.user));
	}
}