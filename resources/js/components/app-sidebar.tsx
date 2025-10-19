// resources\js\components\app-sidebar.tsx

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Shield, GitBranch, HeartPulse, Hotel, Home, DollarSign } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';
import { GithubUpdatesModal } from '@/components/github-updates-modal';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        requiredPermissions: [],
    },
    {
        title: 'Pulse',
        href: '/pulse',
        icon: HeartPulse,
        requiredPermissions: ['pulse access', 'global access'],
        isExternal: true,
    },
    {
        title: 'Accommodations',
        href: '/accommodations',
        icon: Hotel,
        requiredPermissions: ['accommodation show', 'global access'],
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: Home,
        requiredPermissions: ['booking show', 'global access'],
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: DollarSign,
        requiredPermissions: ['payment show', 'global access'],
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
        requiredPermissions: ['user show', 'global access'],
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Shield,
        requiredPermissions: ['role show', 'global access'],
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    // Filter navigation items based on user permissions
    const mainNavItems = useMemo(() => {
        return allNavItems.filter(item => {
            // If no permissions required, show the item
            if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
                return true;
            }

            // Check if user has any of the required permissions
            return item.requiredPermissions.some(permission =>
                auth.user?.permissions?.includes(permission)
            );
        });
    }, [auth.user?.permissions]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href='/dashboard' prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <GithubUpdatesModal>
                            <SidebarMenuButton className="w-full cursor-pointer animate-pulse-glow" asChild>
                                <button className="flex items-center gap-2 w-full">
                                    <GitBranch className="h-4 w-4" />
                                    <span>Updates</span>
                                </button>
                            </SidebarMenuButton>
                        </GithubUpdatesModal>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
