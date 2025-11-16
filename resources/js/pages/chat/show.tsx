// resources/js/pages/chat/show.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { type ChatShowProps, type ChatMessage } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Send, UserCheck, X, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';
import { toast } from 'sonner';

export default function Show({ conversation }: ChatShowProps) {
    const { user, isAdmin, isStaff } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const messageText = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            // Make sure conversation.id exists
            if (!conversation?.id) {
                throw new Error('Conversation ID is missing');
            }

            const response = await axios.post(`/chat/${conversation.id}/messages`, {
                message: messageText,
            });
            setMessages([...messages, response.data.message]);
            toast.success('Message sent');
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || error.response.statusText;

                if (status === 403) {
                    toast.error('Access denied: ' + message);
                } else if (status === 404) {
                    toast.error('Conversation not found');
                } else if (status === 422) {
                    const errors = error.response.data?.errors;
                    const firstError = errors ? Object.values(errors)[0] : message;
                    toast.error('Validation error: ' + firstError);
                } else if (status === 500) {
                    toast.error('Server error: ' + message);
                } else {
                    toast.error('Error: ' + message);
                }
            } else if (error.request) {
                toast.error('Network error: No response from server');
            } else {
                toast.error('Failed to send message: ' + error.message);
            }
            setInput(messageText);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = () => {
        if (!conversation?.id) return;
        router.post(`/chat/${conversation.id}/assign`, {}, {
            onSuccess: () => toast.success('Conversation assigned to you'),
        });
    };

    const handleClose = () => {
        if (!conversation?.id) return;
        router.post(`/chat/${conversation.id}/close`, {}, {
            onSuccess: () => toast.success('Conversation closed'),
        });
    };

    const handleReopen = () => {
        if (!conversation?.id) return;
        router.post(`/chat/${conversation.id}/reopen`, {}, {
            onSuccess: () => toast.success('Conversation reopened'),
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            open: 'default',
            assigned: 'secondary',
            closed: 'outline',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/chat">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold">
                                {conversation.subject || 'Chat Conversation'}
                            </h1>
                            {getStatusBadge(conversation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {conversation.participant_name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {(isAdmin() || isStaff()) && conversation.status === 'open' && (
                        <Button size="sm" variant="outline" onClick={handleAssign}>
                            <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                            Assign to Me
                        </Button>
                    )}
                    {(isAdmin() || isStaff()) && conversation.status !== 'closed' && (
                        <Button size="sm" variant="outline" onClick={handleClose}>
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Close
                        </Button>
                    )}
                    {conversation.status === 'closed' && (
                        <Button size="sm" variant="outline" onClick={handleReopen}>
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Reopen
                        </Button>
                    )}
                </div>
            </div>

            <Card className="h-[calc(100vh-250px)] flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                        const isOwnMessage = user
                            ? message.sender_id === user.id
                            : message.sender_id === null;

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                        isOwnMessage
                                            ? 'bg-[#E55A2B] text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <p className="text-xs font-semibold mb-1 opacity-80">
                                        {message.sender_display_name}
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {format(new Date(message.created_at), 'HH:mm')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </CardContent>

                {conversation.status !== 'closed' && (
                    <form onSubmit={sendMessage} className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Chat', href: '/chat' },
            { title: 'Conversation', href: '#' },
        ]}
    >
        <div className="p-4">{page}</div>
    </AppLayout>
);
