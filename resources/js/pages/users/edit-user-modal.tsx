import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PasswordInput } from '@/components/password-input';
import PasswordRequirements, { validatePassword } from '@/components/password-requirements';
import { type UserRole, type UserData, type UserFormData } from '@/types';
import users from '@/routes/users';
import { LoaderCircle } from 'lucide-react';

interface EditUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserData;
    availableRoles: UserRole[];
}

export default function EditUserModal({
    open,
    onOpenChange,
    user,
    availableRoles
}: EditUserModalProps) {
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm<UserFormData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        status: 'active',
        email_verified_at: false,
        password_changed_at: false,
        roles: [],
    });

    useEffect(() => {
        if (open && user) {
            setData({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                password: '',
                password_confirmation: '',
                status: user.status,
                email_verified_at: !!user.email_verified_at,
                password_changed_at: !!user.password_changed_at,
                roles: user.roles,
            });
            setShowPasswordRequirements(false);
        }
    }, [open, user]);

    const handlePasswordChange = (password: string) => {
        setData('password', password);
        setShowPasswordRequirements(password.length > 0);

        // Clear password confirmation when password changes
        if (data.password_confirmation) {
            setData('password_confirmation', '');
        }
    };

    const { isValid: isPasswordValid } = validatePassword(data.password);
    const isPasswordMatch = data.password === data.password_confirmation;

    // For edit form, we need to check if password is required
    const passwordRequired = data.password.length > 0;
    const canSubmit = data.name && data.email &&
        (!passwordRequired || (isPasswordValid && isPasswordMatch)) &&
        !processing;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // If password is provided, validate it
        if (data.password) {
            const { isValid } = validatePassword(data.password);
            if (!isValid) {
                return;
            }

            // Check password confirmation
            if (data.password !== data.password_confirmation) {
                return;
            }
        }

        put(users.update.url(user.id), {
            onSuccess: () => {
                onOpenChange(false);
                setShowPasswordRequirements(false);
            },
        });
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData('roles', data.roles.filter((r: string) => r !== roleName));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Edit User: {user?.name}
                        {user?.id === 1 && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Super Admin
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter full name"
                            className={errors.name ? 'border-red-500' : ''}
                            disabled={user?.id === 1}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter email address"
                            className={errors.email ? 'border-red-500' : ''}
                            disabled={user?.id === 1}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Enter phone number"
                            className={errors.phone ? 'border-red-500' : ''}
                            disabled={user?.id === 1}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-500">{errors.phone}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            New Password
                            <span className="text-xs text-muted-foreground ml-1">(leave blank to keep current)</span>
                        </Label>
                        <PasswordInput
                            id="password"
                            value={data.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            placeholder="Enter new password"
                            className={errors.password ? 'border-red-500' : ''}
                            disabled={user?.id === 1}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                        <PasswordRequirements
                            password={data.password}
                            show={showPasswordRequirements}
                        />
                    </div>

                    {/* Password Confirmation */}
                    {data.password && (
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                            <PasswordInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Confirm new password"
                                className={errors.password_confirmation ? 'border-red-500' : ''}
                                disabled={user?.id === 1}
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                            )}
                            {data.password_confirmation && !isPasswordMatch && (
                                <p className="text-sm text-red-600">Passwords do not match</p>
                            )}
                            {data.password_confirmation && isPasswordMatch && data.password && (
                                <p className="text-sm text-green-600">Passwords match</p>
                            )}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                            disabled={user?.id === 1}
                        >
                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-red-500">{errors.status}</p>
                        )}
                    </div>

                    {/* Bypass */}
                    <div className="grid gap-2">
                        <Label>Bypass</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="email_verified_at"
                                    checked={data.email_verified_at}
                                    onCheckedChange={(checked) => setData('email_verified_at', checked as boolean)}
                                    disabled={user?.id === 1}
                                />
                                <Label htmlFor="email_verified_at" className="text-sm">
                                    Email verified
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="password_changed_at"
                                    checked={data.password_changed_at}
                                    onCheckedChange={(checked) => setData('password_changed_at', checked as boolean)}
                                    disabled={user?.id === 1}
                                />
                                <Label htmlFor="password_changed_at" className="text-sm">
                                    Password changed
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="grid gap-2">
                        <Label>Assign Roles</Label>
                        <div className="border rounded-lg h-48 overflow-y-auto p-4 space-y-3">
                            {availableRoles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={data.roles.includes(role.name)}
                                        onCheckedChange={(checked) =>
                                            handleRoleChange(role.name, checked as boolean)
                                        }
                                        disabled={
                                            user?.id === 1 ||
                                            (role.name === 'admin' && user.is_admin && data.roles.includes('admin'))
                                        }
                                    />
                                    <Label className="text-sm cursor-pointer">
                                        {role.label}
                                        {role.name === 'admin' && (
                                            <span className="ml-2 text-xs text-red-600 font-medium">
                                                (Admin Role)
                                            </span>
                                        )}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors.roles && (
                            <p className="text-sm text-red-600">{errors.roles}</p>
                        )}
                    </div>

                    {user?.id === 1 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                Super admin user fields are protected and cannot be modified.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                setShowPasswordRequirements(false);
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSubmit || user?.id === 1}
                        >
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            {processing ? 'Updating...' : 'Update User'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
