import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import PasswordRequirements, { validatePassword } from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface FirstTimePasswordProps {
    email: string;
}

export default function FirstTimePassword({ email }: FirstTimePasswordProps) {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setData('password', value);
        setShowPasswordRequirements(value.length > 0);
    };

    const handlePasswordConfirmationChange = (value: string) => {
        setPasswordConfirmation(value);
        setData('password_confirmation', value);
    };

    const { isValid: isPasswordValid } = validatePassword(password);
    const isPasswordMatch = password === passwordConfirmation;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/first-time-password', {
            onSuccess: () => {
                setPassword('');
                setPasswordConfirmation('');
            }
        });
    };

    return (
        <AuthLayout
            title="First Time Login"
            description="Welcome! Please set your new password to continue"
        >
            <Head title="First Time Password" />

            <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        className="mt-1 block w-full"
                        readOnly
                        disabled
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">New Password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        autoFocus
                    />
                    <InputError message={errors.password} />
                    <PasswordRequirements
                        password={password}
                        show={showPasswordRequirements}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={passwordConfirmation}
                        onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                    {passwordConfirmation && !isPasswordMatch && (
                        <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
                    {passwordConfirmation && isPasswordMatch && password && (
                        <p className="text-sm text-green-600">Passwords match</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="mt-4 w-full"
                    disabled={
                        processing ||
                        !isPasswordValid ||
                        !isPasswordMatch ||
                        !password ||
                        !passwordConfirmation
                    }
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                    Set Password & Continue
                </Button>
            </form>
        </AuthLayout>
    );
}
