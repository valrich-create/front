import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';
import {
  ChatState,
  MessageRequest,
  MessageResponse,
  MessageThreadRequest,
  MessageThreadResponse,
  ParticipantResponse
} from "./chat";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `/api/messaging`;
  private chatStateSubject = new BehaviorSubject<ChatState>({
    selectedThread: null,
    messages: [],
    threads: [],
    classThreads: [],
    searchQuery: '',
    isLoading: false,
    error: null,
    participants: []
  });

  public chatState$ = this.chatStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Thread operations
  createThread(request: MessageThreadRequest): Observable<MessageThreadResponse> {
    this.updateState({ isLoading: true });
    return this.http.post<MessageThreadResponse>(`${this.apiUrl}/threads`, request).pipe(
        tap(thread => {
          const currentState = this.chatStateSubject.value;
          this.updateState({
            threads: [...currentState.threads, thread],
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to create thread');
          throw error;
        })
    );
  }

  getUserThreads(userId: string): Observable<MessageThreadResponse[]> {
    this.updateState({ isLoading: true });
    return this.http.get<MessageThreadResponse[]>(`${this.apiUrl}/users/${userId}/threads`).pipe(
        tap(threads => {
          this.updateState({
            threads,
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to load user threads');
          throw error;
        })
    );
  }

  getClassThreadsByEstablishment(establishmentId: string): Observable<MessageThreadResponse[]> {
    this.updateState({ isLoading: true });
    return this.http.get<MessageThreadResponse[]>(
        `${this.apiUrl}/establishments/${establishmentId}/class-threads`
    ).pipe(
        tap(threads => {
          this.updateState({
            classThreads: threads,
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to load class threads');
          throw error;
        })
    );
  }

  getUserThreadsByEstablishment(userId: string, establishmentId: string): Observable<MessageThreadResponse[]> {
    this.updateState({ isLoading: true });
    return this.http.get<MessageThreadResponse[]>(
        `${this.apiUrl}/users/${userId}/establishments/${establishmentId}/threads`
    ).pipe(
        tap(threads => {
          this.updateState({
            threads,
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to load user threads for establishment');
          throw error;
        })
    );
  }

  // Message operations
  sendMessage(request: MessageRequest): Observable<MessageResponse> {
    this.updateState({ isLoading: true });
    return this.http.post<MessageResponse>(`${this.apiUrl}/messages`, request).pipe(
        tap(message => {
          const currentState = this.chatStateSubject.value;
          if (currentState.selectedThread?.id === message.threadId) {
            this.updateState({
              messages: [...currentState.messages, message],
              isLoading: false
            });
          }
        }),
        catchError(error => {
          this.handleError('Failed to send message');
          throw error;
        })
    );
  }

  getThreadMessages(threadId: string): Observable<MessageResponse[]> {
    this.updateState({ isLoading: true });
    return this.http.get<MessageResponse[]>(`${this.apiUrl}/threads/${threadId}/messages`).pipe(
        tap(messages => {
          this.updateState({
            messages,
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to load messages');
          throw error;
        })
    );
  }

  // Participant operations
  addParticipantsToThread(threadId: string, userIds: string[]): Observable<MessageThreadResponse> {
    this.updateState({ isLoading: true });
    return this.http.post<MessageThreadResponse>(
        `${this.apiUrl}/threads/${threadId}/participants`, userIds
    ).pipe(
        tap(thread => {
          const currentState = this.chatStateSubject.value;
          const updatedThreads = currentState.threads.map(t =>
              t.id === thread.id ? thread : t
          );
          this.updateState({
            threads: updatedThreads,
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to add participants');
          throw error;
        })
    );
  }

  getThreadParticipants(threadId: string): Observable<ParticipantResponse[]> {
    this.updateState({ isLoading: true });
    return this.http.get<ParticipantResponse[]>(`${this.apiUrl}/threads/${threadId}/participants`).pipe(
        tap(participants => {
          this.updateState({
            participants,
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to load participants');
          throw error;
        })
    );
  }

  // Selection and state management
  selectThread(thread: MessageThreadResponse): void {
    this.updateState({
      selectedThread: thread,
      isLoading: true
    });

    // Load messages and participants in parallel
    this.getThreadMessages(thread.id).subscribe();
    this.getThreadParticipants(thread.id).subscribe();
  }

  clearSelectedThread(): void {
    this.updateState({
      selectedThread: null,
      messages: [],
      participants: []
    });
  }

  // Search functionality
  searchThreads(query: string, establishmentId: string): Observable<MessageThreadResponse[]> {
    this.updateState({ searchQuery: query, isLoading: true });

    return this.http.get<MessageThreadResponse[]>(
        `${this.apiUrl}/users/${this.getCurrentUserId()}/establishments/${establishmentId}/threads`
    ).pipe(
        tap(threads => {
          const filteredThreads = threads.filter(thread =>
              thread.title.toLowerCase().includes(query.toLowerCase())
          );
          this.updateState({
            threads: filteredThreads,
            isLoading: false
          });
        }),
        catchError(error => {
          this.handleError('Failed to search threads');
          throw error;
        })
    );
  }

  // Count operations
  countMessagesInThread(threadId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/threads/${threadId}/messages/count`);
  }

  countParticipantsInThread(threadId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/threads/${threadId}/participants/count`);
  }

  countAllThreadsInEstablishment(establishmentId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/establishments/${establishmentId}/threads/count`);
  }

  // Helper methods
  private updateState(partialState: Partial<ChatState>): void {
    const currentState = this.chatStateSubject.value;
    this.chatStateSubject.next({
      ...currentState,
      ...partialState
    });
  }

  private handleError(errorMessage: string): void {
    this.updateState({
      error: errorMessage,
      isLoading: false
    });
  }

  getCurrentState(): ChatState {
    return this.chatStateSubject.value;
  }

  private getCurrentUserId(): string {
    // In a real app, this would come from auth service
    return 'current-user-id'; // Replace with actual user ID
  }
}
