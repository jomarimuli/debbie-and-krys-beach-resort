import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Accommodation, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Hotel } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import accommodations from '@/routes/accommodations';

export default function Show({ accommodation }: PageProps & { accommodation: Accommodation }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(
        accommodation.image_urls?.[0] || null
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={accommodations.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{accommodation.name}</h1>
                        <p className="text-sm text-muted-foreground">Accommodation details</p>
                    </div>
                </div>
                <Link href={accommodations.edit.url({ accommodation: accommodation.id })}>
                    <Button size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>
                </Link>
            </div>

            {accommodation.image_urls && accommodation.image_urls.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="w-full h-80 bg-muted rounded overflow-hidden">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={accommodation.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Hotel className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {accommodation.image_urls.length > 1 && (
                            <div className="grid grid-cols-6 gap-2">
                                {accommodation.image_urls.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(url)}
                                        className={`relative h-16 rounded overflow-hidden border-2 transition-all ${
                                            selectedImage === url
                                                ? 'border-primary'
                                                : 'border-transparent hover:border-muted-foreground'
                                        }`}
                                    >
                                        <img
                                            src={url}
                                            alt={`${accommodation.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                            <p className="text-sm font-medium">{accommodation.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                            <Badge variant="outline" className="capitalize text-xs">
                                {accommodation.type}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Size</p>
                            <Badge variant="outline" className="capitalize text-xs">
                                {accommodation.size}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Air Conditioned</p>
                            <Badge variant={accommodation.is_air_conditioned ? 'default' : 'secondary'} className="text-xs">
                                {accommodation.is_air_conditioned ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Description</p>
                            <p className="text-sm">{accommodation.description || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            <Badge variant={accommodation.is_active ? 'default' : 'secondary'} className="text-xs">
                                {accommodation.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Capacity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Min Capacity</p>
                            <p className="text-sm font-medium">{accommodation.min_capacity ? `${accommodation.min_capacity} pax` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Max Capacity</p>
                            <p className="text-sm font-medium">{accommodation.max_capacity ? `${accommodation.max_capacity} pax` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Sort Order</p>
                            <p className="text-sm font-medium">{accommodation.sort_order}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {accommodation.rates && accommodation.rates.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">
                            Pricing Rates ({accommodation.rates.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking Type</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Additional Pax</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accommodation.rates.map((rate) => (
                                    <TableRow key={rate.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize text-xs">
                                                {rate.booking_type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            ₱{parseFloat(rate.rate).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {rate.additional_pax_rate ? `₱${parseFloat(rate.additional_pax_rate).toLocaleString()}` : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={rate.is_active ? 'default' : 'secondary'} className="text-xs">
                                                {rate.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Accommodations', href: '/accommodations' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
