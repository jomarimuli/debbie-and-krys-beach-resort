// resources/js/pages/chat/index.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type ChatIndexProps, type ChatConversation, type ChatStatus } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { MessageCircle, ArrowRight, LoaderCircle } from 'lucide-react';
import { useEffect, useState, FormEventHandler } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

const statusVariants: Record<ChatStatus, 'default' | 'secondary' | 'outline'> = {
    open: 'default',
    assigned: 'secondary',
    closed: 'outline',
};

export default function Index({ conversations: initialConversations, totalUnreadCount: initialUnreadCount }: ChatIndexProps) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState(initialConversations);

    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
        guest_name: '',
        guest_email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/chat', {
            onSuccess: () => {
                reset();
            },
        });
    };

    useEffect(() => {
        // Broadcasting logic (commented out)
    }, [user]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Chat</h1>
                {initialUnreadCount > 0 && (
                    <Badge variant="destructive" className="h-6 px-1.5 text-xs">
                        {initialUnreadCount}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Conversations List */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">
                            {user ? 'Your Conversations' : 'Conversations'} ({conversations.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {conversations.length > 0 ? (
                            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                                {conversations.map((conversation: ChatConversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={`/chat/${conversation.id}`}
                                        className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm">
                                                    {conversation.subject || 'Chat Conversation'}
                                                </p>
                                                <Badge variant={statusVariants[conversation.status as ChatStatus]}>
                                                    {conversation.status}
                                                </Badge>
                                                {conversation.unread_messages_count > 0 && (
                                                    <Badge variant="destructive" className="h-6 px-1.5 text-xs">
                                                        {conversation.unread_messages_count}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {conversation.participant_name} · {format(new Date(conversation.updated_at), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                            {conversation.latest_message && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                    {conversation.latest_message.message}
                                                </p>
                                            )}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                                <h3 className="text-base font-medium mb-1">No conversations yet</h3>
                                <p className="text-sm text-muted-foreground">Start a new conversation to get help</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* New Chat Form */}
                <Card className="lg:sticky lg:top-4 h-fit">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Start New Chat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {!user && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="guest_name" className="text-sm">Your Name</Label>
                                        <Input
                                            id="guest_name"
                                            value={data.guest_name}
                                            onChange={(e) => setData('guest_name', e.target.value)}
                                            className="h-9"
                                            placeholder="John Doe"
                                        />
                                        {errors.guest_name && (
                                            <p className="text-xs text-destructive">{errors.guest_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="guest_email" className="text-sm">Your Email</Label>
                                        <Input
                                            id="guest_email"
                                            type="email"
                                            value={data.guest_email}
                                            onChange={(e) => setData('guest_email', e.target.value)}
                                            className="h-9"
                                            placeholder="john@example.com"
                                        />
                                        {errors.guest_email && (
                                            <p className="text-xs text-destructive">{errors.guest_email}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="subject" className="text-sm">Subject (Optional)</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="h-9"
                                    placeholder="What do you need help with?"
                                />
                                {errors.subject && (
                                    <p className="text-xs text-destructive">{errors.subject}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message" className="text-sm">Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                    placeholder="How can we help you?"
                                />
                                {errors.message && (
                                    <p className="text-xs text-destructive">{errors.message}</p>
                                )}
                            </div>

                            <Button type="submit" disabled={processing} size="sm" className="w-full">
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Start Chat
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Chat', href: '#' },
        ]}
    >
        <div className="p-4">{page}</div>
    </AppLayout>
);
