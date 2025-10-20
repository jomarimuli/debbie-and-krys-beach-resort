import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Accommodation, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Hotel } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useState } from 'react';

export default function Show({ accommodation }: PageProps & { accommodation: Accommodation }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(
        accommodation.image_urls?.[0] || null
    );

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/accommodations">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{accommodation.name}</h1>
                        <p className="text-muted-foreground">Accommodation details</p>
                    </div>
                </div>
                <Link href={`/accommodations/${accommodation.id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            {/* Image Gallery */}
            {accommodation.image_urls && accommodation.image_urls.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Main Image */}
                        <div className="w-full h-96 bg-muted rounded-lg overflow-hidden">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={accommodation.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Hotel className="h-16 w-16 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {accommodation.image_urls.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {accommodation.image_urls.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(url)}
                                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
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

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{accommodation.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <Badge variant="outline" className="capitalize">
                                {accommodation.type}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Air Conditioned</p>
                            <Badge variant={accommodation.is_air_conditioned ? 'default' : 'secondary'}>
                                {accommodation.is_air_conditioned ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="font-medium">{accommodation.description || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={accommodation.is_active ? 'default' : 'secondary'}>
                                {accommodation.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Capacity & Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Min Capacity</p>
                            <p className="font-medium">{accommodation.min_capacity ? `${accommodation.min_capacity} pax` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Max Capacity</p>
                            <p className="font-medium">{accommodation.max_capacity ? `${accommodation.max_capacity} pax` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Quantity Available</p>
                            <p className="font-medium">{accommodation.quantity_available}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sort Order</p>
                            <p className="font-medium">{accommodation.sort_order}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {accommodation.rates && accommodation.rates.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Pricing Rates</CardTitle>
                        <CardDescription>{accommodation.rates.length} rate(s) configured</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking Type</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Base Capacity</TableHead>
                                    <TableHead>Additional Pax Rate</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accommodation.rates.map((rate) => (
                                    <TableRow key={rate.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {rate.booking_type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ₱{parseFloat(rate.rate).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {rate.base_capacity ? `${rate.base_capacity} pax` : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {rate.additional_pax_rate ? `₱${parseFloat(rate.additional_pax_rate).toLocaleString()}` : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={rate.is_active ? 'default' : 'secondary'}>
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
        </>
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
        {page}
    </AppLayout>
);
