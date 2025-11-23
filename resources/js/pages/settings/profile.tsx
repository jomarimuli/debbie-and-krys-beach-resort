// resources/js/pages/settings/profile.tsx
import { useState, useEffect } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { usePhilippinesLocations } from '@/hooks/use-philippines-locations';
import { LocationSelect } from '@/components/location-select';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.roles?.includes('admin') ?? false;

    const {
        selectedCountry,
        selectedProvince,
        selectedCity,
        addressLine,
        setAddressLine,
        handleCountryChange,
        handleProvinceChange,
        handleCityChange,
        countryOptions,
        provinceOptions,
        cityOptions,
        getFormattedAddress
    } = usePhilippinesLocations();

    // Update formatted address when location changes
    const formattedAddress = getFormattedAddress();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Surname, Given Name"
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                        readOnly={isAdmin}
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                    {isAdmin && (
                                        <p className="text-sm text-muted-foreground">
                                            Admin email cannot be edited.
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.phone}
                                        name="phone"
                                        autoComplete="tel"
                                        placeholder="Phone number"
                                    />
                                    <InputError className="mt-2" message={errors.phone} />
                                </div>

                                <div className="grid gap-4">
                                    <Label>Address</Label>

                                    {auth.user?.address && (
                                        <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                                            <p className="text-muted-foreground">Current:</p>
                                            <p className="font-medium">{auth.user.address}</p>
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <LocationSelect
                                            value={selectedCountry}
                                            onChange={handleCountryChange}
                                            options={countryOptions}
                                            placeholder="Select country"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <LocationSelect
                                            value={selectedProvince}
                                            onChange={handleProvinceChange}
                                            options={provinceOptions}
                                            placeholder="Select province/state"
                                            disabled={!selectedCountry}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <LocationSelect
                                            value={selectedCity}
                                            onChange={handleCityChange}
                                            options={cityOptions}
                                            placeholder="Select city"
                                            disabled={!selectedProvince}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Input
                                            id="address_line"
                                            type="text"
                                            value={addressLine}
                                            onChange={(e) => setAddressLine(e.target.value)}
                                            placeholder="Street address and/or barangay"
                                            disabled={!selectedCity}
                                        />
                                    </div>

                                    <input type="hidden" name="address" value={formattedAddress} />

                                    <InputError className="mt-2" message={errors.address} />
                                </div>

                                {mustVerifyEmail && auth.user?.email_verified_at === null && !isAdmin && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button className='cursor-pointer' disabled={processing}>Save</Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* <DeleteUser /> */}
            </SettingsLayout>
        </AppLayout>
    );
}
