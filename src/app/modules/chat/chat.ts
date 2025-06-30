export interface MessageThreadResponse {
	id: string;
	title: string;
	creatorId: string;
	classServiceId?: string;
	participantIds: Set<string>;
	establishmentId: string;
	createdAt: string;
}

export interface MessageResponse {
	id: string;
	content: string;
	threadId: string;
	sendAt: string;
	updatedAt: string;
	senderId: string;
	establishmentId: string;
}

export interface ParticipantResponse {
	userId: string;
	firstName: string;
	lastName: string;
	role: string;
}

export interface MessageThreadRequest {
	classServiceId?: string;
	participantIds?: Set<string>;
}

export interface MessageRequest {
	threadId: string;
	content: string;
}

// Frontend state management
export interface ChatState {
	selectedThread: MessageThreadResponse | null;
	messages: MessageResponse[];
	threads: MessageThreadResponse[];
	classThreads: MessageThreadResponse[];
	searchQuery: string;
	isLoading: boolean;
	error: string | null;
	participants: ParticipantResponse[];
}