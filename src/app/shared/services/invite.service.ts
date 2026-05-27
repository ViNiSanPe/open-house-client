import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../config/environment';
import { Invite, ApiError } from '../../core/models/invite.model';

@Injectable({
    providedIn: 'root'
})
export class InviteService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiBaseUrl;

    /**
     * GET /invite/:id
     * Fetch invite details by ID
     */
    getInvite(id: string): Observable<Invite> {
        return this.http
            .get<Invite>(`${this.apiUrl}/invite/${id}`)
            .pipe(catchError(this.handleError));
    }

    /**
     * PATCH /invite/email/:id
     * Update invite email address
     */
    updateEmail(id: string, email: string): Observable<void> {
        return this.http
            .patch<void>(`${this.apiUrl}/invite/email/${id}`, { email })
            .pipe(catchError(this.handleError));
    }

    /**
     * PATCH /invite/presence/:id
     * Confirm attendance (set confirmed = true)
     */
    confirmPresence(id: string): Observable<void> {
        return this.http
            .patch<void>(`${this.apiUrl}/invite/presence/${id}`, {})
            .pipe(catchError(this.handleError));
    }

    /**
     * Error handling
     * Transforms HTTP errors into user-friendly messages
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let apiError: ApiError = {
            message: 'Erro ao conectar com o servidor. Tente novamente.',
            statusCode: error.status
        };

        if (error.status === 404) {
            apiError.message = 'Convite não encontrado.';
        } else if (error.status === 400) {
            apiError.message = error.error?.message || 'Dados inválidos. Verifique o email.';
        } else if (error.status === 0) {
            apiError.message = 'Erro de conexão. Verifique sua internet.';
        } else if (error.error?.message) {
            apiError.message = error.error.message;
        }

        return throwError(() => apiError);
    }
}
