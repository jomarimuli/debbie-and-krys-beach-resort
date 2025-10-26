import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type AccommodationRate, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import accommodationRates from '@/routes/accommodation-rates';

export default function Show({ rate }: PageProps & { rate: AccommodationRate }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={accommodationRates.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{rate.accommodation?.name}</h1>
                        <p className="text-sm text-muted-foreground capitalize">
                            {rate.booking_type.replace('_', ' ')} Rate
                        </p>
                    </div>
                </div>
                <Link href={accommodationRates.edit.url({ accommodation_rate: rate.id })}>
                    <Button size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Rate Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Accommodation</p>
                            <p className="text-sm font-medium">{rate.accommodation?.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Booking Type</p>
                            <Badge variant="outline" className="capitalize text-xs">
                                {rate.booking_type.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Rate</p>
                            <p className="text-xl font-bold">₱{parseFloat(rate.rate).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            <Badge variant={rate.is_active ? 'default' : 'secondary'} className="text-xs">
                                {rate.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Capacity & Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Additional Pax Rate</p>
                            <p className="text-sm font-medium">
                                {rate.additional_pax_rate
                                    ? `₱${parseFloat(rate.additional_pax_rate).toLocaleString()}`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Adult Entrance Fee</p>
                            <p className="text-sm font-medium">
                                {rate.adult_entrance_fee
                                    ? `₱${parseFloat(rate.adult_entrance_fee).toLocaleString()}`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Child Entrance Fee</p>
                            <p className="text-sm font-medium">
                                {rate.child_entrance_fee
                                    ? `₱${parseFloat(rate.child_entrance_fee).toLocaleString()} (${rate.child_max_age} years & below)`
                                    : 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Inclusions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Free Cottage</p>
                            <Badge variant={rate.includes_free_cottage ? 'default' : 'secondary'} className="text-xs">
                                {rate.includes_free_cottage ? 'Included' : 'Not Included'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Free Entrance</p>
                            <Badge variant={rate.includes_free_entrance ? 'default' : 'secondary'} className="text-xs">
                                {rate.includes_free_entrance ? 'Included' : 'Not Included'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
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
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
