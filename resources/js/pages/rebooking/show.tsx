// resources/js/pages/rebooking/show.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Rebooking, type PageProps } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, XCircle, FileText, Plus, Banknote, ReceiptText, LoaderCircle } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import rebookings from '@/routes/rebookings';
import bookings from '@/routes/bookings';
import payments from '@/routes/payments';
import refunds from '@/routes/refunds';
import { useAuth } from '@/hooks/use-auth';

export default function Show({ rebooking }: PageProps & { rebooking: Rebooking }) {
    const { can, user, isAdmin, isStaff } = useAuth();
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const { data: approveData, setData: setApproveData, post: postApprove, processing: approving, errors: approveErrors } = useForm({
        rebooking_fee: '0',
        admin_notes: '',
    });

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting, errors: rejectErrors } = useForm({
        admin_notes: '',
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'outline',
            approved: 'default',
            completed: 'secondary',
            cancelled: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize text-xs">
                {status}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'outline',
            paid: 'default',
            refunded: 'secondary',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize text-xs">
                {status}
            </Badge>
        );
    };

    const handleApprove = () => {
        postApprove(rebookings.approve.url({ rebooking: rebooking.id }), {
            onSuccess: () => setShowApproveDialog(false),
        });
    };

    const handleReject = () => {
        postReject(rebookings.reject.url({ rebooking: rebooking.id }), {
            onSuccess: () => setShowRejectDialog(false),
        });
    };

    const [isCompleting, setIsCompleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleStatusChange = (action: string) => {
        const routes: Record<string, string> = {
            complete: rebookings.complete.url({ rebooking: rebooking.id }),
            cancel: rebookings.cancel.url({ rebooking: rebooking.id }),
        };

        if (routes[action]) {
            if (action === 'complete') setIsCompleting(true);
            if (action === 'cancel') setIsCancelling(true);

            router.post(routes[action], {}, {
                onFinish: () => {
                    setIsCompleting(false);
                    setIsCancelling(false);
                }
            });
        }
    };

    const needsPayment = parseFloat(rebooking.total_adjustment) > 0 && rebooking.payment_status === 'pending';
    const needsRefund = parseFloat(rebooking.total_adjustment) < 0 && rebooking.payment_status === 'pending';

    const isOwner = user?.id === rebooking.original_booking?.created_by;
    const canEdit = (isAdmin() || isStaff() || isOwner) && can('booking edit') && rebooking.status === 'pending';
    const canApprove = (isAdmin() || isStaff()) && can('booking edit');
    const canComplete = (isAdmin() || isStaff()) && can('booking edit');
    const canCancel = (isAdmin() || isStaff() || isOwner) && can('booking edit');
    const canRecordPayment = (isAdmin() || isStaff()) && can('payment create');
    const canProcessRefund = (isAdmin() || isStaff()) && can('refund create');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={rebookings.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{rebooking.rebooking_number}</h1>
                        <p className="text-sm text-muted-foreground">
                            Rebooking for {rebooking.original_booking?.guest_name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {rebooking.status === 'pending' && canApprove && (
                        <>
                            <Button size="sm" onClick={() => setShowApproveDialog(true)}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowRejectDialog(true)}>
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Reject
                            </Button>
                            {canEdit && (
                                <Link href={rebookings.edit.url({ rebooking: rebooking.id })}>
                                    <Button size="sm" variant="outline">
                                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                                        Edit
                                    </Button>
                                </Link>
                            )}
                        </>
                    )}
                    {rebooking.status === 'approved' && canComplete && (
                        <Button size="sm" onClick={() => handleStatusChange('complete')} disabled={isCompleting}>
                            {isCompleting ? (
                                <LoaderCircle className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Complete
                        </Button>
                    )}
                    {!['cancelled', 'completed'].includes(rebooking.status) && canCancel && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange('cancel')} disabled={isCancelling}>
                            {isCancelling ? (
                                <LoaderCircle className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Original Booking</CardTitle>
                            {rebooking.original_booking && (
                                <Link href={bookings.show.url({ booking: rebooking.original_booking.id })}>
                                    <Button variant="ghost" size="sm">
                                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                                        View
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {rebooking.original_booking && (
                            <>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                                    <p className="text-sm font-medium">{rebooking.original_booking.booking_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Guest Name</p>
                                    <p className="text-sm font-medium">{rebooking.original_booking.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Check-in Date</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(rebooking.original_booking.check_in_date), 'MMMM dd, yyyy')}
                                    </p>
                                </div>
                                {rebooking.original_booking.check_out_date && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Check-out Date</p>
                                        <p className="text-sm font-medium">
                                            {format(new Date(rebooking.original_booking.check_out_date), 'MMMM dd, yyyy')}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Original Guests</p>
                                    <p className="text-sm font-medium">
                                        {rebooking.original_booking.total_adults} Adults, {rebooking.original_booking.total_children} Children
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Original Amount</p>
                                    <p className="text-sm font-medium">₱{parseFloat(rebooking.original_amount).toLocaleString()}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Rebooking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            <div className="flex gap-2">
                                {getStatusBadge(rebooking.status)}
                                {getPaymentStatusBadge(rebooking.payment_status)}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">New Check-in Date</p>
                            <p className="text-sm font-medium">
                                {format(new Date(rebooking.new_check_in_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {rebooking.new_check_out_date && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">New Check-out Date</p>
                                <p className="text-sm font-medium">
                                    {format(new Date(rebooking.new_check_out_date), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">New Guests</p>
                            <p className="text-sm font-medium">
                                {rebooking.new_total_adults} Adults, {rebooking.new_total_children} Children
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">New Amount</p>
                            <p className="text-sm font-medium">₱{parseFloat(rebooking.new_amount).toLocaleString()}</p>
                        </div>
                        {rebooking.processed_by_user && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Processed By</p>
                                <p className="text-sm font-medium">{rebooking.processed_by_user.name}</p>
                            </div>
                        )}
                        {rebooking.approved_at && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Approved At</p>
                                <p className="text-sm font-medium">
                                    {format(new Date(rebooking.approved_at), 'MMM dd, yyyy HH:mm')}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {rebooking.accommodations && rebooking.accommodations.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">New Accommodations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rebooking.accommodations.map((item) => (
                                <div key={item.id} className="flex justify-between items-start p-2 border rounded text-sm">
                                    <div>
                                        <p className="font-medium">{item.accommodation?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.guests} guests - {item.accommodation_rate?.booking_type.replace('_', ' ')} ({item.accommodation_rate?.booking_type === 'overnight' ? '22 hours' : '8 hours'})
                                        </p>
                                        {parseFloat(item.additional_pax_charge) > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                Additional: ₱{parseFloat(item.additional_pax_charge).toLocaleString()}
                                            </p>
                                        )}
                                        {item.free_entrance_used > 0 && (
                                            <p className="text-xs text-blue-600">
                                                Free entrance: {item.free_entrance_used} pax
                                            </p>
                                        )}
                                    </div>
                                    <p className="font-medium">₱{parseFloat(item.subtotal).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {rebooking.entrance_fees && rebooking.entrance_fees.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">New Entrance Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rebooking.entrance_fees.map((fee) => (
                                <div key={fee.id} className="flex justify-between items-center p-2 border rounded text-sm">
                                    <div>
                                        <p className="font-medium capitalize">{fee.type}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {fee.quantity} × ₱{parseFloat(fee.rate).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="font-medium">₱{parseFloat(fee.subtotal).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Original Amount</span>
                        <span className="font-medium">₱{parseFloat(rebooking.original_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">New Amount</span>
                        <span className="font-medium">₱{parseFloat(rebooking.new_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold">Amount Difference</span>
                        <span className={`font-semibold ${parseFloat(rebooking.amount_difference) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(rebooking.amount_difference) >= 0 ? '+' : ''}₱{parseFloat(rebooking.amount_difference).toLocaleString()}
                        </span>
                    </div>
                    {parseFloat(rebooking.rebooking_fee) > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rebooking Fee</span>
                            <span className="font-medium text-red-600">₱{parseFloat(rebooking.rebooking_fee).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold">Total Adjustment</span>
                        <span className={`font-semibold ${parseFloat(rebooking.total_adjustment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(rebooking.total_adjustment) >= 0 ? '+' : ''}₱{parseFloat(rebooking.total_adjustment).toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {rebooking.payments && rebooking.payments.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Rebooking Payments</CardTitle>
                            {needsPayment && rebooking.status === 'approved' && canRecordPayment && (
                                <Link href={`${payments.create.url()}?rebooking_id=${rebooking.id}`}>
                                    <Button size="sm" variant="outline">
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        Record Payment
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rebooking.payments.map((payment) => (
                                <Link
                                    key={payment.id}
                                    href={payments.show.url({ payment: payment.id })}
                                    className="flex justify-between items-center p-2 border rounded hover:bg-muted/50 transition-colors"
                                >
                                    <div className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                                            <p className="font-medium">{payment.payment_number}</p>
                                            <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                                                Rebooking
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground ml-5">
                                            {format(new Date(payment.payment_date), 'MMM dd, yyyy')} · {payment.payment_method.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <p className="font-medium text-sm text-green-600">+₱{parseFloat(payment.amount).toLocaleString()}</p>
                                </Link>
                            ))}
                        </div>
                        {rebooking.total_paid && parseFloat(rebooking.total_paid) > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Required Payment:</span>
                                    <span className="font-medium">
                                        ₱{parseFloat(rebooking.total_adjustment).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-muted-foreground">Total Paid:</span>
                                    <span className="font-medium text-green-600">
                                        ₱{parseFloat(rebooking.total_paid).toLocaleString()}
                                    </span>
                                </div>
                                {rebooking.remaining_payment && parseFloat(rebooking.remaining_payment) > 0 && (
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="font-semibold">Remaining:</span>
                                        <span className="font-semibold text-red-600">
                                            ₱{parseFloat(rebooking.remaining_payment).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {rebooking.refunds && rebooking.refunds.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Rebooking Refunds</CardTitle>
                            {needsRefund && rebooking.status === 'approved' && canProcessRefund && (
                                <Link href={`${refunds.create.url()}?rebooking_id=${rebooking.id}`}>
                                    <Button size="sm" variant="outline">
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        Process Refund
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rebooking.refunds.map((refund) => (
                                <Link
                                    key={refund.id}
                                    href={refunds.show.url({ refund: refund.id })}
                                    className="flex justify-between items-center p-2 border rounded hover:bg-muted/50 transition-colors"
                                >
                                    <div className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <ReceiptText className="h-3.5 w-3.5 text-muted-foreground" />
                                            <p className="font-medium">{refund.refund_number}</p>
                                            <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                                                Rebooking
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground ml-5">
                                            {format(new Date(refund.refund_date), 'MMM dd, yyyy')} · {refund.refund_method.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <p className="font-medium text-sm text-red-600">-₱{parseFloat(refund.amount).toLocaleString()}</p>
                                </Link>
                            ))}
                        </div>
                        {rebooking.total_refunded && parseFloat(rebooking.total_refunded) > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Required Refund:</span>
                                    <span className="font-medium">
                                        ₱{Math.abs(parseFloat(rebooking.total_adjustment)).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-muted-foreground">Total Refunded:</span>
                                    <span className="font-medium text-red-600">
                                        ₱{parseFloat(rebooking.total_refunded).toLocaleString()}
                                    </span>
                                </div>
                                {rebooking.remaining_refund && parseFloat(rebooking.remaining_refund) > 0 && (
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="font-semibold">Remaining:</span>
                                        <span className="font-semibold text-red-600">
                                            ₱{parseFloat(rebooking.remaining_refund).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {rebooking.status === 'approved' && rebooking.payment_status === 'pending' && (
                <>
                    {needsPayment && (!rebooking.payments || rebooking.payments.length === 0) && canRecordPayment && (
                        <Card className="border-green-200 bg-green-50/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium text-green-800">Payment Required</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-green-700 mb-3">
                                    This rebooking requires an additional payment of ₱{parseFloat(rebooking.total_adjustment).toLocaleString()}.
                                </p>
                                <Link href={`${payments.create.url()}?rebooking_id=${rebooking.id}`}>
                                    <Button size="sm">
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        Record Payment
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                    {needsRefund && (!rebooking.refunds || rebooking.refunds.length === 0) && canProcessRefund && (
                        <Card className="border-red-200 bg-red-50/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium text-red-800">Refund Required</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-700 mb-3">
                                    This rebooking requires a refund of ₱{Math.abs(parseFloat(rebooking.total_adjustment)).toLocaleString()}.
                                </p>
                                <Link href={`${refunds.create.url()}?rebooking_id=${rebooking.id}`}>
                                    <Button size="sm" variant="destructive">
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        Process Refund
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {(rebooking.reason || rebooking.admin_notes) && (
                <div className="grid gap-4 md:grid-cols-2">
                    {rebooking.reason && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{rebooking.reason}</p>
                            </CardContent>
                        </Card>
                    )}
                    {rebooking.admin_notes && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Admin Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{rebooking.admin_notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Rebooking</DialogTitle>
                        <DialogDescription>
                            Approve rebooking request {rebooking.rebooking_number}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="rebooking_fee" className="text-sm">Rebooking Fee (Optional)</Label>
                            <Input
                                id="rebooking_fee"
                                type="number"
                                step="0.01"
                                min="0"
                                value={approveData.rebooking_fee}
                                onChange={(e) => setApproveData('rebooking_fee', e.target.value)}
                                className="h-9"
                                placeholder="0.00"
                            />
                            {approveErrors.rebooking_fee && <p className="text-xs text-destructive">{approveErrors.rebooking_fee}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="admin_notes" className="text-sm">Admin Notes (Optional)</Label>
                            <Textarea
                                id="admin_notes"
                                value={approveData.admin_notes}
                                onChange={(e) => setApproveData('admin_notes', e.target.value)}
                                rows={3}
                                className="resize-none"
                                placeholder="Optional notes..."
                            />
                            {approveErrors.admin_notes && <p className="text-xs text-destructive">{approveErrors.admin_notes}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={approving}>
                            {approving && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Rebooking</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting rebooking request {rebooking.rebooking_number}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                        <Label htmlFor="reject_notes" className="text-sm">Reason <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="reject_notes"
                            value={rejectData.admin_notes}
                            onChange={(e) => setRejectData('admin_notes', e.target.value)}
                            rows={3}
                            className="resize-none"
                            placeholder="Explain why this request is being rejected..."
                            required
                        />
                        {rejectErrors.admin_notes && <p className="text-xs text-destructive">{rejectErrors.admin_notes}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={rejecting || !rejectData.admin_notes}>
                            {rejecting && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Rebookings', href: '/rebookings' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
