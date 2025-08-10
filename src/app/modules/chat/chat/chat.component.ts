import { Component, OnInit } from '@angular/core';
import { LayoutComponent } from "../../base-component/components/layout/layout.component";
import { MessageResponse, MessageThreadResponse } from '../chat';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ChatService } from "../chat.service";
import { UserService } from "../../users/services/user.service";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { NewConversationDialogComponent } from "../new-conversation-dialog/new-conversation-dialog.component";
import { ClassServiceService } from "../../services/class-service.service";
import { lastValueFrom } from "rxjs";
import { UserResponse } from "../../users/users.models";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss']
})
export class ChatComponent implements OnInit {
  threads: MessageThreadResponse[] = [];
  selectedThread: MessageThreadResponse | null = null;
  messages: MessageResponse[] = [];
  newMessage = '';
  searchQuery = '';
  isMobile = false;
  showChatDetail = false;
  currentUser: UserResponse | null = null;
  availableUsers: UserResponse[] = [];
  availableClasses: any[] = [];

  constructor(
      private chatService: ChatService,
      private userService: UserService,
      private classService: ClassServiceService,
      private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadUserThreads();
    await this.loadEstablishmentData();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  async loadCurrentUser() {
    try {
      const user$ = this.userService.getCurrentUser();
      this.currentUser = await lastValueFrom(user$);
    } catch (error) {
      console.error('Failed to load current user', error);
    }
  }

  async loadUserThreads() {
    if (!this.currentUser) return;
    try {
      const threads$ = this.chatService.getUserThreads(this.currentUser.id);
      this.threads = await lastValueFrom(threads$);
    } catch (error) {
      console.error('Failed to load threads', error);
    }
  }

  async loadEstablishmentData() {
    if (!this.currentUser?.establishmentId) return;

    try {
      const [users, classes] = await Promise.all([
        lastValueFrom(this.userService.getAllUsers()),
        lastValueFrom(this.classService.getClassServicesByEstablishment(this.currentUser.establishmentId))
      ]);

      // Filtrer les utilisateurs du même établissement
      this.availableUsers = (users.content || []).filter(
          user => user.establishmentId === this.currentUser?.establishmentId
      );
      this.availableClasses = classes;
    } catch (error) {
      console.error('Failed to load establishment data', error);
    }
  }

  async selectThread(thread: MessageThreadResponse) {
    this.selectedThread = thread;
    this.showChatDetail = true;

    try {
      const messages$ = this.chatService.getThreadMessages(thread.id);
      this.messages = await lastValueFrom(messages$);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.selectedThread) return;

    const messageRequest = {
      threadId: this.selectedThread.id,
      content: this.newMessage,
      establishmentId: this.selectedThread.establishmentId
    };

    try {
      await lastValueFrom(this.chatService.sendMessage(messageRequest));
      this.newMessage = '';
      await this.selectThread(this.selectedThread);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async openNewConversationDialog() {
    if (!this.currentUser?.establishmentId) {
      console.error('No establishment ID available');
      return;
    }

    const dialogRef = this.dialog.open(NewConversationDialogComponent, {
      width: '500px',
      data: {
        users: this.availableUsers,
        classes: this.availableClasses
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNewThread(result);
      }
    });
  }

  async createNewThread(data: any) {
    if (!this.currentUser) return;

    const participantIds = Array.isArray(data.selectedUsers) ? data.selectedUsers : [];
    const request = {
      classServiceId: data.selectedClass || null,
      participantIds: participantIds
    };

    try {
      const newThread = await lastValueFrom(this.chatService.createThread(request));
      this.threads.push(newThread);
      this.selectThread(newThread);
    } catch (error) {
      console.error('Failed to create thread', error);
    }
  }

  getFilteredThreads(): MessageThreadResponse[] {
    return this.threads.filter(thread =>
        thread.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  isOwnMessage(message: MessageResponse): boolean {
    return message.senderId === this.currentUser?.id;
  }

  getSenderName(senderId: string): string {
    const user = this.availableUsers.find(u => u.id === senderId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  getInitials(name: string): string {
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  closeChatDetail() {
    this.showChatDetail = false;
    if (this.isMobile) {
      this.selectedThread = null;
    }
  }

  // Méthodes de tracking pour optimiser les performances
  trackByThreadId(index: number, thread: MessageThreadResponse): string {
    return thread.id;
  }

  trackByMessageId(index: number, message: MessageResponse): string {
    return message.id || `${message.senderId}-${message.sendAt}`;
  }
}