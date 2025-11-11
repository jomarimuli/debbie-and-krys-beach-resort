// resources/js/components/app-sidebar.tsx

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Shield, GitBranch, HeartPulse, Hotel, Ticket, Coins, Banknote, MessageSquare, Image as ImageIcon, Megaphone, Home, Wallet, ReceiptText, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';
import { GithubUpdatesModal } from '@/components/github-updates-modal';

const allNavGroups: NavGroup[] = [
    {
        title: 'Main',
        items: [
            {
                title: 'Home',
                href: '/',
                icon: Home,
                requiredPermissions: [],
            },
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
        ],
    },
    {
        title: 'Booking Management',
        items: [
            {
                title: 'Accommodations',
                href: '/accommodations',
                icon: Hotel,
                requiredPermissions: ['accommodation show', 'global access'],
            },
            {
                title: 'Rates',
                href: '/accommodation-rates',
                icon: Coins,
                requiredPermissions: ['accommodation-rate show', 'global access'],
            },
            {
                title: 'Bookings',
                href: '/bookings',
                icon: Ticket,
                requiredPermissions: ['booking show', 'global access'],
            },
            {
                title: 'Rebookings',
                href: '/rebookings',
                icon: RefreshCw,
                requiredPermissions: ['booking show', 'global access'],
            },
        ],
    },
    {
        title: 'Financial',
        items: [
            {
                title: 'Payments',
                href: '/payments',
                icon: Banknote,
                requiredPermissions: ['payment show', 'global access'],
            },
            {
                title: 'Refunds',
                href: '/refunds',
                icon: ReceiptText,
                requiredPermissions: ['refund show', 'global access'],
            },
            {
                title: 'Payment Accounts',
                href: '/payment-accounts',
                icon: Wallet,
                requiredPermissions: ['payment-account show', 'global access'],
            },
        ],
    },
    {
        title: 'Content',
        items: [
            {
                title: 'Feedbacks',
                href: '/feedbacks',
                icon: MessageSquare,
                requiredPermissions: ['feedback show', 'global access'],
            },
            {
                title: 'Gallery',
                href: '/galleries',
                icon: ImageIcon,
                requiredPermissions: ['gallery show', 'global access'],
            },
            {
                title: 'Announcements',
                href: '/announcements',
                icon: Megaphone,
                requiredPermissions: ['announcement show', 'global access'],
            },
        ],
    },
    {
        title: 'Administration',
        items: [
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
        ],
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    // Filter navigation groups and items based on user permissions
    const mainNavGroups = useMemo(() => {
        return allNavGroups
            .map(group => ({
                ...group,
                items: group.items.filter(item => {
                    // If no permissions required, show the item
                    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
                        return true;
                    }

                    // Check if user has any of the required permissions
                    return item.requiredPermissions.some(permission =>
                        auth.user?.permissions?.includes(permission)
                    );
                }),
            }))
            .filter(group => group.items.length > 0); // Remove empty groups
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
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <div className="border-t pt-2">
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
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
