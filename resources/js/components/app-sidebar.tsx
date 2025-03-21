import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, BookOpen, ChartAreaIcon, HandCoins, BadgeDollarSignIcon, BriefcaseBusinessIcon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Liquidity',
        url: '#',
        icon: HandCoins,
        items: [
            {
                title: 'Rupee',
                url: route('liquidity.lkr'),
                icon: null,
            },
            {
                title: 'Foreign Currency',
                url: route('liquidity.fcy'),
                icon: null,
            },
        ],
    },
    // Fixed Income
    {
        title: 'Fixed Income',
        url: route('fixed-income.index'),
        icon:  LayoutGrid,

    },
    // USDLKR
    {
        title: 'USDLKR',
        url: route('usd-lkr.index'),
        icon: BadgeDollarSignIcon,
    },
    // Corporate Desk
    {
        title: 'Corporate Desk',
        url: route('corporate.index'),
        icon: BriefcaseBusinessIcon,
    },
    // ALM
    {
        title: 'ALM',
        url: '#',
        icon: ChartAreaIcon,
    },
    // Rates
    {
        title: 'Rates',
        url: '#',
        icon: ChartAreaIcon,
    },
    // MIS
    {
        title: 'MIS',
        url: '#',
        icon:  BookOpen,
    },

];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     url: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     url: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
