import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Announcement, type PageProps } from '@/types';
import announcements from '@/routes/announcements';
import { format } from 'date-fns';

export default function Edit({ announcement }: PageProps & { announcement: Announcement }) {
    const { data, setData, put, processing, errors } = useForm({
        title: announcement.title,
        content: announcement.content,
        is_active: announcement.is_active,
        published_at: announcement.published_at
            ? format(new Date(announcement.published_at), 'yyyy-MM-dd\'T\'HH:mm')
            : '',
        expires_at: announcement.expires_at
            ? format(new Date(announcement.expires_at), 'yyyy-MM-dd\'T\'HH:mm')
            : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(announcements.update.url({ announcement: announcement.id }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={announcements.show.url({ announcement: announcement.id })}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Edit Announcement</h1>
                    <p className="text-sm text-muted-foreground">{announcement.title}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Announcement Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-sm cursor-text select-text">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="h-9"
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="content" className="text-sm cursor-text select-text">
                                Content
                            </Label>
                            <Textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="published_at" className="text-sm cursor-text select-text">
                                    Publish Date & Time
                                </Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(e) => setData('published_at', e.target.value)}
                                    className="h-9"
                                />
                                {errors.published_at && (
                                    <p className="text-xs text-destructive">{errors.published_at}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="expires_at" className="text-sm cursor-text select-text">
                                    Expiry Date & Time (Optional)
                                </Label>
                                <Input
                                    id="expires_at"
                                    type="datetime-local"
                                    value={data.expires_at}
                                    onChange={(e) => setData('expires_at', e.target.value)}
                                    className="h-9"
                                />
                                {errors.expires_at && <p className="text-xs text-destructive">{errors.expires_at}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm cursor-pointer select-text">
                                Active
                            </Label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing} size="sm">
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Update Announcement
                            </Button>
                            <Link href={announcements.show.url({ announcement: announcement.id })}>
                                <Button type="button" variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Announcements', href: '/announcements' },
            { title: 'Edit', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
