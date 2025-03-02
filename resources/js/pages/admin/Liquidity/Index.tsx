import { Head, Link, router } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BreadcrumbItem } from '@/types';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LiquidityItem {
    id: number;
    record_date: string;
    market_liquidity: number | null;
    boc_liquidity: number | null;
    srr: number | null;
    slfr: number | null;
    sdfr: number | null;
    opr: number | null;
    // Other fields from the model...
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface AdminLiquidityIndexProps {
    liquidityData: {
        data: LiquidityItem[];
    } & PaginationData;
}

export default function AdminLiquidityIndex({ liquidityData }: AdminLiquidityIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

    // Define breadcrumbs for navigation
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Admin', href: '#' },
        { title: 'Liquidity Management', href: route('admin.liquidity.index'), current: true },
    ];

    const confirmDelete = (id: number) => {
        setDeletingItemId(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (deletingItemId) {
            router.delete(route('admin.liquidity.destroy', deletingItemId), {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setDeletingItemId(null);
                },
            });
        }
    };

    return (
        <AppShell variant="header">
            <Head title="Liquidity Management" />
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>
                <div className="container py-6">
                    <div className="flex justify-between items-center mb-6">
                        <Heading
                            title="Liquidity Management"
                            description="Manage daily liquidity records"
                        />
                        <Button asChild>
                            <Link href={route('admin.liquidity.create')}>
                                <PlusIcon className="w-4 h-4 mr-2" /> Add New Record
                            </Link>
                        </Button>
                    </div>

                    <div className="bg-white rounded-md shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Market Liquidity</TableHead>
                                    <TableHead>BOC Liquidity</TableHead>
                                    <TableHead>SRR</TableHead>
                                    <TableHead>SLFR</TableHead>
                                    <TableHead>SDFR</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {liquidityData.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.record_date}</TableCell>
                                        <TableCell>{item.market_liquidity}</TableCell>
                                        <TableCell>{item.boc_liquidity}</TableCell>
                                        <TableCell>{item.srr && (item.srr * 100).toFixed(2)}%</TableCell>
                                        <TableCell>{item.slfr && (item.slfr * 100).toFixed(2)}%</TableCell>
                                        <TableCell>{item.sdfr && (item.sdfr * 100).toFixed(2)}%</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('admin.liquidity.edit', item.id)}>
                                                        <PencilIcon className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => confirmDelete(item.id)}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {liquidityData.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No records found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination controls would go here */}
                        <div className="flex items-center justify-between p-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {liquidityData.data.length} of {liquidityData.total} records
                            </div>
                            {/* Pagination component */}
                        </div>
                    </div>
                </div>
            </AppContent>

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this liquidity record. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppShell>
    );
}
