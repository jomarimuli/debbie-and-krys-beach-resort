import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type PageProps, type PaymentAccount } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Wallet, Eye, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
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

interface PaymentAccountIndexProps extends PageProps {
    payment_accounts: {
        data: PaymentAccount[];
        total: number;
    };
}

const paymentTypeLabels: Record<PaymentAccount['type'], string> = {
    bank: 'Bank',
    gcash: 'GCash',
    maya: 'Maya',
    other: 'Other',
};

const paymentTypeColors: Record<PaymentAccount['type'], string> = {
    bank: 'bg-blue-100 text-blue-800',
    gcash: 'bg-green-100 text-green-800',
    maya: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
};

export default function Index({ payment_accounts }: PaymentAccountIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/payment-accounts/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Payment Accounts</h1>
                    <p className="text-sm text-muted-foreground">Manage payment account information</p>
                </div>
                <Link href="/payment-accounts/create">
                    <Button size="sm">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add Account
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Payment Accounts ({payment_accounts.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Account Number</TableHead>
                                <TableHead>Bank Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payment_accounts.data.map((account: PaymentAccount) => (
                                <TableRow key={account.id}>
                                    <TableCell>
                                        <Badge variant="secondary" className={paymentTypeColors[account.type]}>
                                            {paymentTypeLabels[account.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">{account.account_name}</TableCell>
                                    <TableCell className="text-sm">{account.account_number || '-'}</TableCell>
                                    <TableCell className="text-sm">{account.bank_name || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={account.is_active ? 'default' : 'secondary'} className="text-xs">
                                            {account.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/payment-accounts/${account.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={`/payment-accounts/${account.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDeleteId(account.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {payment_accounts.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Wallet className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No payment accounts found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete payment account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the payment account. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payment Accounts', href: '#' },
        ]}
    >
        <div className="p-4">{page}</div>
    </AppLayout>
);
