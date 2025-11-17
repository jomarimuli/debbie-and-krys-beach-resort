// resources/js/pages/chat/auto-replies.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface AutoReply {
    id: number;
    trigger_type: string;
    message: string;
    is_active: boolean;
    delay_seconds: number;
}

interface AutoRepliesProps {
    autoReplies: AutoReply[];
}

export default function AutoReplies({ autoReplies }: AutoRepliesProps) {
    const welcomeReply = autoReplies.find(r => r.trigger_type === 'new_conversation');

    const { data, setData, put, processing, errors } = useForm<{
        message: string;
        is_active: boolean;
        delay_seconds: number;
    }>({
        message: welcomeReply?.message || '',
        is_active: welcomeReply?.is_active ?? true,
        delay_seconds: welcomeReply?.delay_seconds || 2,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (welcomeReply) {
            put(`/chat/auto-replies/${welcomeReply.id}`);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">Auto-Reply</h1>
                <p className="text-sm text-muted-foreground">
                    Manage automatic responses for new conversations
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Welcome Message</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="message">Auto-Reply Message</Label>
                            <Textarea
                                id="message"
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                rows={6}
                                className="resize-none"
                                placeholder="Enter your automatic welcome message..."
                            />
                            {errors.message && (
                                <p className="text-xs text-destructive">{errors.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="delay_seconds">Delay (seconds)</Label>
                            <Input
                                id="delay_seconds"
                                type="number"
                                min="0"
                                max="60"
                                value={data.delay_seconds}
                                onChange={(e) => setData('delay_seconds', parseInt(e.target.value))}
                                className="h-9 w-32"
                            />
                            <p className="text-xs text-muted-foreground">
                                Wait time before sending auto-reply
                            </p>
                            {errors.delay_seconds && (
                                <p className="text-xs text-destructive">{errors.delay_seconds}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Enable auto-reply
                            </Label>
                        </div>

                        <Button type="submit" disabled={processing} size="sm">
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

AutoReplies.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Chat', href: '/chat' },
            { title: 'Auto-Replies', href: '#' },
        ]}
    >
        <div className="p-4">{page}</div>
    </AppLayout>
);
