// resources/js/components/app-header.tsx
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Shield, Menu, Search, GitBranch, HeartPulse, Hotel, Ticket, Coins, Banknote, MessageSquare, Image as ImageIcon, Megaphone, Home, Wallet, ReceiptText, RefreshCw, MessageCircleQuestion, MessageCircle, Settings } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { GithubUpdatesModal } from '@/components/github-updates-modal';

const allNavItems: NavItem[] = [
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
    },
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
    {
        title: 'FAQs',
        href: '/faqs',
        icon: MessageCircleQuestion,
        requiredPermissions: ['faq show', 'global access'],
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageCircle,
        requiredPermissions: ['chat access', 'global access'],
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

const rightNavItems: NavItem[] = [
    {
        title: 'Updates',
        href: '#',
        icon: GitBranch,
    },
];

const activeItemStyles = 'text-neutral-900';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

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
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                item.isExternal ? (
                                                    <a key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </a>
                                                ) : (
                                                    <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                )
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <GithubUpdatesModal key={item.title}>
                                                    <button className="flex items-center space-x-2 font-medium w-full text-left cursor-pointer animate-pulse-glow">
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </button>
                                                </GithubUpdatesModal>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href='/dashboard' prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        {item.isExternal ? (
                                            <a
                                                href={item.href}
                                                className={cn(
                                                    navigationMenuTriggerStyle(),
                                                    page.url === item.href && activeItemStyles,
                                                    'h-9 cursor-pointer px-3',
                                                )}
                                            >
                                                {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                {item.title}
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    navigationMenuTriggerStyle(),
                                                    page.url === item.href && activeItemStyles,
                                                    'h-9 cursor-pointer px-3',
                                                )}
                                            >
                                                {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                {item.title}
                                            </Link>
                                        )}
                                        {(item.href === '/' ? page.url === '/' : page.url.startsWith(item.href)) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer">
                                <Search className="size-5! opacity-80 group-hover:opacity-100" />
                            </Button>
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <GithubUpdatesModal>
                                                    <button className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer animate-pulse-glow">
                                                        <span className="sr-only">{item.title}</span>
                                                        {item.icon && <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />}
                                                    </button>
                                                </GithubUpdatesModal>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user?.avatar} alt={auth.user?.name || 'User'} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black">
                                            {getInitials(auth.user?.name || 'User')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && <UserMenuContent user={auth.user} />}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
