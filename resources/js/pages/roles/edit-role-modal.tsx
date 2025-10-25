import { useEffect } from 'react';
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
import { RoleFormData, PermissionCategory, Role } from '@/types';
import roles from '@/routes/roles';

interface EditRoleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role;
    permissions: PermissionCategory[];
}

export default function EditRoleModal({
    open,
    onOpenChange,
    role,
    permissions
}: EditRoleModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm<RoleFormData>({
        name: '',
        permissions: [],
    });

    useEffect(() => {
        if (open && role) {
            setData({
                name: role.name,
                permissions: role.permissions,
            });
        }
    }, [open, role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(roles.update.url(role.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        }
    };

    const isCategorySelected = (categoryPermissions: string[]) => {
        return categoryPermissions.every(p => data.permissions.includes(p));
    };

    const isCategoryIndeterminate = (categoryPermissions: string[]) => {
        return categoryPermissions.some(p => data.permissions.includes(p)) &&
               !categoryPermissions.every(p => data.permissions.includes(p));
    };

    const handleCategoryChange = (categoryPermissions: string[], checked: boolean) => {
        if (checked) {
            const newPermissions = [...data.permissions];
            categoryPermissions.forEach(p => {
                if (!newPermissions.includes(p)) {
                    newPermissions.push(p);
                }
            });
            setData('permissions', newPermissions);
        } else {
            setData('permissions', data.permissions.filter(p => !categoryPermissions.includes(p)));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Role: {role?.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Label>Permissions</Label>
                        <div className="border rounded-lg h-64 overflow-y-auto p-4 space-y-4">
                            {permissions.map((category) => {
                                const categoryPermissionNames = category.permissions.map(p => p.name);
                                const isSelected = isCategorySelected(categoryPermissionNames);
                                const isIndeterminate = isCategoryIndeterminate(categoryPermissionNames);

                                return (
                                    <div key={category.category} className="space-y-3">
                                        <div className="flex items-center space-x-2 pb-2 border-b">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) =>
                                                    handleCategoryChange(categoryPermissionNames, checked as boolean)
                                                }
                                                className={isIndeterminate ? 'data-[state=checked]:bg-orange-500' : ''}
                                            />
                                            <Label className="font-semibold text-sm uppercase tracking-wide">
                                                {category.category}
                                            </Label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 ml-6">
                                            {category.permissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={data.permissions.includes(permission.name)}
                                                        onCheckedChange={(checked) =>
                                                            handlePermissionChange(permission.name, checked as boolean)
                                                        }
                                                    />
                                                    <Label className="text-sm">{permission.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.permissions && (
                            <p className="text-sm text-red-500">{errors.permissions}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Role'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
