import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Maximize, Minimize, Check, X, Loader2 } from 'lucide-react';
import { type BreadcrumbItem as BreadcrumbItemType, Notification, AppSidebarHeaderProps } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    notifications = [],
    loading = false,
    onMarkAsRead,
    onMarkAllAsRead,
    onRemoveNotification,
    onRefreshNotifications
}: AppSidebarHeaderProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Handle fullscreen functionality
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => {
                console.error('Error attempting to exit fullscreen:', err);
            });
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Mark notification as read
    const handleMarkAsRead = (notificationId: string) => {
        onMarkAsRead?.(notificationId);
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = () => {
        onMarkAllAsRead?.();
    };

    // Remove notification
    const handleRemoveNotification = (notificationId: string) => {
        onRemoveNotification?.(notificationId);
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <div className="w-2 h-2 bg-green-500 rounded-full" />;
            case 'warning':
                return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
            case 'error':
                return <div className="w-2 h-2 bg-red-500 rounded-full" />;
            default:
                return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 cursor-pointer" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Notifications Dropdown */}
                {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-8 w-8 cursor-pointer">
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifications</span>
                            <div className="flex items-center gap-2">
                                {onRefreshNotifications && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onRefreshNotifications}
                                        className="h-auto p-1 text-xs cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            'Refresh'
                                        )}
                                    </Button>
                                )}
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="h-auto p-1 text-xs cursor-pointer"
                                        disabled={loading}
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {loading ? (
                            <div className="p-4 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No notifications
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className="flex items-start gap-3 p-3 cursor-pointer"
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                    >
                                        <div className="shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${
                                                        notification.isRead
                                                            ? 'text-muted-foreground'
                                                            : 'text-foreground'
                                                    }`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`text-xs ${
                                                        notification.isRead
                                                            ? 'text-muted-foreground/70'
                                                            : 'text-muted-foreground'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                                        {notification.timestamp}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}
                                                            disabled={loading}
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveNotification(notification.id);
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu> */}

                {/* Fullscreen Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                    {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                    ) : (
                        <Maximize className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </header>
    );
}
