import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {environment} from "../../../../environments/environment";
import {Router} from "@angular/router";
import {ToastService} from "../../base-component/services/toast/toast.service";

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

	constructor(private http: HttpClient, private router: Router, private toastService: ToastService) {}

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
		// Créer la requête POST
		const logout$ = this.http.post(`${this.API_URL}/logout`, {}).pipe(
			// Tap pour des effets secondaires comme le logging
			tap(() => console.log('Logout request sent to server')),
			// Même en cas d'erreur, on continue pour nettoyer le local storage
			catchError((error) => {
				console.error('Logout failed:', error);
				return of(null); // Continuer le flux même après une erreur
			}),
			// Nettoyer le stockage dans tous les cas (succès ou erreur)
			tap(() => {
				localStorage.removeItem(this.TOKEN_KEY);
				localStorage.removeItem(this.USER_KEY);
				sessionStorage.removeItem(this.TOKEN_KEY);
				sessionStorage.removeItem(this.USER_KEY);
				console.log('Storage cleared');
				this.router.navigate(['/login']);
			})
		);

		// Retourner l'Observable (doit être souscrit par l'appelant)
		return logout$;
	}

	// logout(): Observable<any> {
	// 	const logout$ = this.http.post(`${this.API_URL}/logout`, {})
	// 		.pipe(
	// 			catchError(() => {
	// 				// Even if server logout fails, clear local storage
	// 				return of(null);
	// 			})
	// 		);
	//
	// 	console.log('Logout:', logout$);
	//
	// 	return logout$.pipe(
	// 		tap(() => {
	// 			localStorage.removeItem(this.TOKEN_KEY);
	// 			localStorage.removeItem(this.USER_KEY);
	// 			sessionStorage.removeItem(this.TOKEN_KEY);
	// 			sessionStorage.removeItem(this.USER_KEY);
	// 		})
	// 	);
	// }

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

	/**
	 * Reset du mot de passe d’un utilisateur (action ADMIN)
	 * @param userId UUID de l’utilisateur cible
	 * @param newPassword nouveau mot de passe en clair
	 */
	resetPassword(userId: string, newPassword: string): Observable<{ message: string }> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.getToken()}`
		});

		return this.http.post<{ message: string }>(
			`${this.API_URL}/${userId}/reset-password`,
			{ newPassword },
			{ headers }
		).pipe(
			tap(
				() => console.log('Admin reset password OK for', userId),
				this.toastService.success
			),
			catchError(err => {
				const msg = err?.error?.error || err?.error || 'Erreur lors du reset admin';
				this.toastService.error(msg);
				return throwError(() => new Error(msg));
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