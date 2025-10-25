import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { PasswordInput } from '@/components/password-input';
import PasswordRequirements, { validatePassword } from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const { isValid: isPasswordValid } = validatePassword(password);
    const isPasswordMatch = password === passwordConfirmation;

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setShowPasswordRequirements(value.length > 0);
    };

    const handlePasswordConfirmationChange = (value: string) => {
        setPasswordConfirmation(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={['password', 'password_confirmation', 'current_password']}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        onSuccess={() => {
                            setPassword('');
                            setPasswordConfirmation('');
                            setShowPasswordRequirements(false);
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">Current password</Label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                    />

                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">New password</Label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        value={password}
                                        onChange={(e) => handlePasswordChange(e.target.value)}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                    />

                                    <InputError message={errors.password} />

                                    <PasswordRequirements
                                        password={password}
                                        show={showPasswordRequirements}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        value={passwordConfirmation}
                                        onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                    />

                                    <InputError message={errors.password_confirmation} />

                                    {passwordConfirmation && !isPasswordMatch && (
                                        <p className="text-sm text-red-600">Passwords do not match</p>
                                    )}
                                    {passwordConfirmation && isPasswordMatch && password && (
                                        <p className="text-sm text-green-600">Passwords match</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        className='cursor-pointer'
                                        disabled={
                                            processing ||
                                            !isPasswordValid ||
                                            !isPasswordMatch ||
                                            !password ||
                                            !passwordConfirmation
                                        }
                                    >
                                        Save password
                                    </Button>

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
            </SettingsLayout>
        </AppLayout>
    );
}
