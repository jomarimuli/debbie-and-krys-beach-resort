// resources/js/pages/faq/index.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type FAQIndexProps, type FAQ } from '@/types';
import { router } from '@inertiajs/react';
import { Plus, MessageCircleQuestion, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { FAQFormDialog } from '@/components/faq-form-dialog';

const emptyFaq: FAQ = {
    id: 0,
    question: '',
    answer: '',
    keywords: [],
    is_active: true,
    order: 0,
    created_at: '',
    updated_at: '',
};

export default function Index({ faqs: faqData }: FAQIndexProps) {
    const { can, isAdmin, isStaff } = useAuth();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/faqs/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const canManageFaq = (isAdmin() || isStaff()) && can('faq create');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">FAQs</h1>
                    <p className="text-sm text-muted-foreground">Manage frequently asked questions</p>
                </div>
                {canManageFaq && (
                    <Button size="sm" onClick={() => setEditingFaq(emptyFaq)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        New FAQ
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All FAQs ({faqData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {faqData.data.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Question</TableHead>
                                    <TableHead className="w-[300px]">Answer</TableHead>
                                    <TableHead className="w-[180px]">Keywords</TableHead>
                                    <TableHead className="w-20">Status</TableHead>
                                    <TableHead className="w-[60px]">Order</TableHead>
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {faqData.data.map((faq: FAQ) => (
                                    <TableRow key={faq.id}>
                                        <TableCell className="max-w-[250px]">
                                            <p className="font-medium text-sm line-clamp-2">{faq.question}</p>
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                            <p className="text-xs text-muted-foreground line-clamp-2">{faq.answer}</p>
                                        </TableCell>
                                        <TableCell className="max-w-[180px]">
                                            <div className="flex flex-wrap gap-1">
                                                {faq.keywords?.slice(0, 2).map((keyword: string, idx: number) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                                {faq.keywords && faq.keywords.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{faq.keywords.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={faq.is_active ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {faq.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{faq.order}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setEditingFaq(faq)}
                                                    aria-label="Edit FAQ"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setDeleteId(faq.id)}
                                                    aria-label="Delete FAQ"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <MessageCircleQuestion className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No FAQs found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this FAQ. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {editingFaq && (
                <FAQFormDialog
                    faq={editingFaq}
                    onClose={() => setEditingFaq(null)}
                />
            )}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'FAQs', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
