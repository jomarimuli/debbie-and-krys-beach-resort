// resources/js/pages/accommodation-rate/show.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type AccommodationRate, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function Show({ rate }: PageProps & { rate: AccommodationRate }) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/accommodation-rates">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{rate.accommodation?.name}</h1>
                        <p className="text-muted-foreground capitalize">{rate.booking_type.replace('_', ' ')} Rate</p>
                    </div>
                </div>
                <Link href={`/accommodation-rates/${rate.id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Rate Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Accommodation</p>
                            <p className="font-medium">{rate.accommodation?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Booking Type</p>
                            <Badge variant="outline" className="capitalize">
                                {rate.booking_type.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Rate</p>
                            <p className="text-2xl font-bold">₱{parseFloat(rate.rate).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                                {rate.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Capacity & Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Base Capacity</p>
                            <p className="font-medium">
                                {rate.base_capacity ? `${rate.base_capacity} pax` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Additional Pax Rate</p>
                            <p className="font-medium">
                                {rate.additional_pax_rate
                                    ? `₱${parseFloat(rate.additional_pax_rate).toLocaleString()}`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Entrance Fee</p>
                            <p className="font-medium">
                                {rate.entrance_fee
                                    ? `₱${parseFloat(rate.entrance_fee).toLocaleString()}`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Child Entrance Fee</p>
                            <p className="font-medium">
                                {rate.child_entrance_fee
                                    ? `₱${parseFloat(rate.child_entrance_fee).toLocaleString()} (${rate.child_max_age} years & below)`
                                    : 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Inclusions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Free Cottage</p>
                            <Badge variant={rate.includes_free_cottage ? 'default' : 'secondary'}>
                                {rate.includes_free_cottage ? 'Included' : 'Not Included'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Free Entrance</p>
                            <Badge variant={rate.includes_free_entrance ? 'default' : 'secondary'}>
                                {rate.includes_free_entrance ? 'Included' : 'Not Included'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Validity Period</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Effective From</p>
                            <p className="font-medium">
                                {rate.effective_from
                                    ? format(new Date(rate.effective_from), 'MMMM dd, yyyy')
                                    : 'No start date'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Effective To</p>
                            <p className="font-medium">
                                {rate.effective_to
                                    ? format(new Date(rate.effective_to), 'MMMM dd, yyyy')
                                    : 'No end date'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Accommodation Rates', href: '/accommodation-rates' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
