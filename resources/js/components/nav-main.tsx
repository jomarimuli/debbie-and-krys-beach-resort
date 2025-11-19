// resources/js/components/nav-main.tsx
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const isActive = item.href === '/' ? page.url === '/' : page.url.startsWith(item.href);

                            if (item.items && item.items.length > 0) {
                                // Filter subitems based on permissions
                                const filteredSubItems = item.items.filter(subItem => {
                                    if (!subItem.requiredPermissions || subItem.requiredPermissions.length === 0) {
                                        return true;
                                    }
                                    return subItem.requiredPermissions.some(permission =>
                                        auth.user?.permissions?.includes(permission)
                                    );
                                });

                                // If no subitems after filtering, skip parent
                                if (filteredSubItems.length === 0) {
                                    return null;
                                }

                                return (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={isActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={{ children: item.title }}
                                                    isActive={isActive}
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <div className="ml-auto flex items-center gap-1">
                                                        {item.badge && item.badge > 0 && (
                                                            <Badge variant="destructive" className="h-6 min-w-5 px-1.5 text-xs">
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                        <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </div>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {filteredSubItems.map((subItem) => {
                                                        const isSubActive = page.url === subItem.href;
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={isSubActive}
                                                                >
                                                                    <Link href={subItem.href} prefetch>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        );
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={{ children: item.title }}
                                    >
                                        {item.isExternal ? (
                                            <a href={item.href}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <Badge variant="destructive" className="h-6 min-w-5 px-1.5 text-xs">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </a>
                                        ) : (
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <Badge variant="destructive" className="h-6 min-w-5 px-1.5 text-xs">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </Link>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
