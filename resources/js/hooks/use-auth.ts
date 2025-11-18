import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function useAuth() {
    const { auth } = usePage<PageProps>().props;

    const hasRole = (role: string | string[]): boolean => {
        if (!auth.user?.roles) return false;

        const roles = Array.isArray(role) ? role : [role];
        return roles.some(r => auth.user?.roles?.includes(r));
    };

    const hasPermission = (permission: string | string[]): boolean => {
        if (!auth.user?.permissions) return false;

        const permissions = Array.isArray(permission) ? permission : [permission];
        return permissions.some(p => auth.user?.permissions?.includes(p));
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return hasRole(roles);
    };

    const hasAllRoles = (roles: string[]): boolean => {
        if (!auth.user?.roles) return false;
        return roles.every(role => auth.user?.roles?.includes(role));
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return hasPermission(permissions);
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!auth.user?.permissions) return false;
        return permissions.every(permission => auth.user?.permissions?.includes(permission));
    };

    const isAdmin = (): boolean => {
        return hasRole('admin') || hasPermission('global access');
    };

    const isStaff = (): boolean => {
        return hasRole('staff');
    };

    const isCustomer = (): boolean => {
        return hasRole('customer');
    };

    const can = (permission: string): boolean => {
        return hasPermission(permission) || hasPermission('global access');
    };

    return {
        user: auth.user,
        hasRole,
        hasPermission,
        hasAnyRole,
        hasAllRoles,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        isStaff,
        isCustomer,
        can,
    };
}
