// resources/js/types/chat.ts

export interface ChatConversation {
    id: number;
    customer_id: number | null;
    staff_id: number | null;
    guest_name: string | null;
    guest_email: string | null;
    guest_session_id: string | null;
    status: 'open' | 'assigned' | 'closed';
    subject: string | null;
    assigned_at: string | null;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
    customer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    staff?: {
        id: number;
        name: string;
        email: string;
    } | null;
    participant_name: string;
    latest_message?: ChatMessage;
    messages?: ChatMessage[];
    messages_count?: number;
}

export interface ChatMessage {
    id: number;
    conversation_id: number;
    sender_id: number | null;
    sender_name: string | null;
    message: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    sender?: {
        id: number;
        name: string;
        email: string;
    } | null;
    sender_display_name: string;
}

export interface ChatFormData {
    subject?: string;
    message: string;
    guest_name?: string;
    guest_email?: string;
}

export interface ChatIndexData {
    conversations: ChatConversation[];
}

export interface ChatShowData {
    conversation: ChatConversation;
}
