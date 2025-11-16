import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type PageProps, type PaymentAccount } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';

const paymentTypeLabels: Record<PaymentAccount['type'], string> = {
    bank: 'Bank',
    gcash: 'GCash',
    maya: 'Maya',
    other: 'Other',
};

import { useAuth } from '@/hooks/use-auth';

export default function Show({ payment_account }: PageProps & { payment_account: PaymentAccount }) {
    const { can, isAdmin, isStaff } = useAuth();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/payment-accounts">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{payment_account.account_name}</h1>
                        <p className="text-sm text-muted-foreground">Payment account details</p>
                    </div>
                </div>
                {/* Only admin/staff can edit */}
                {(isAdmin() || isStaff()) && can('payment-account edit') && (
                    <Link href={`/payment-accounts/${payment_account.id}/edit`}>
                        <Button size="sm">
                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Type</p>
                            <p className="text-sm font-medium">{paymentTypeLabels[payment_account.type]}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Account Name</p>
                            <p className="text-sm font-medium">{payment_account.account_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Account Number</p>
                            <p className="text-sm font-medium">{payment_account.account_number || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Bank Name</p>
                            <p className="text-sm font-medium">{payment_account.bank_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Sort Order</p>
                            <p className="text-sm font-medium">{payment_account.sort_order}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            <Badge variant={payment_account.is_active ? 'default' : 'secondary'} className="text-xs">
                                {payment_account.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {payment_account.qr_code_url && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">QR Code</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img
                                src={payment_account.qr_code_url}
                                alt="QR Code"
                                className="w-full max-w-sm h-64 object-cover rounded border"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payment Accounts', href: '/payment-accounts' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">{page}</div>
    </AppLayout>
);
