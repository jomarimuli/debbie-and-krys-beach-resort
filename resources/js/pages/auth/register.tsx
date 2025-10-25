import { useState } from 'react';
import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useRecaptcha } from '@/hooks/use-recaptcha';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { PasswordInput } from '@/components/password-input';
import PasswordRequirements, { validatePassword } from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        password_confirmation: '',
        recaptcha_token: ''
    });
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { executeRecaptcha } = useRecaptcha();

    const handleGoogleLogin = () => {
        window.location.href = '/auth/google';
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Handle password requirements visibility
        if (field === 'password') {
            setShowPasswordRequirements(value.length > 0);
        }
    };

    const { isValid: isPasswordValid } = validatePassword(formData.password);
    const isPasswordMatch = formData.password === formData.password_confirmation;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting || !isPasswordValid || !isPasswordMatch) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            // Get reCAPTCHA token
            const token = await executeRecaptcha('register');

            if (!token) {
                setErrors({ recaptcha_token: 'Failed to verify reCAPTCHA. Please try again.' });
                setIsSubmitting(false);
                return;
            }

            // Submit with Inertia
            router.post('/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                recaptcha_token: token
            }, {
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                },
                onSuccess: () => {
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ recaptcha_token: 'reCAPTCHA verification failed. Please try again.' });
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="" description="">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            placeholder="Surname, Given Name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="email"
                            placeholder="email@example.com"
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone number (optional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            tabIndex={3}
                            autoComplete="tel"
                            placeholder="09xxxxxxxxx"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address (optional)</Label>
                        <Input
                            id="address"
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            tabIndex={4}
                            autoComplete="street-address"
                            placeholder="City, Province"
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                        <PasswordRequirements
                            password={formData.password}
                            show={showPasswordRequirements}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                            required
                            tabIndex={6}
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                        {formData.password_confirmation && !isPasswordMatch && (
                            <p className="text-sm text-red-600">Passwords do not match</p>
                        )}
                        {formData.password_confirmation && isPasswordMatch && formData.password && (
                            <p className="text-sm text-green-600">Passwords match</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full cursor-pointer"
                        tabIndex={7}
                        disabled={
                            isSubmitting ||
                            !isPasswordValid ||
                            !isPasswordMatch ||
                            !formData.name ||
                            !formData.email ||
                            !formData.password ||
                            !formData.password_confirmation
                        }
                    >
                        {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Register
                    </Button>
                </div>

                <InputError message={errors.recaptcha_token} />

                {/* Google Login Section */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={handleGoogleLogin}
                    tabIndex={8}
                >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                            fill="#4285f4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34a853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#fbbc05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#ea4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign up with Google
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()} tabIndex={9}>
                        Login
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
