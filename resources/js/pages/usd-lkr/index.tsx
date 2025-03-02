import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { BreadcrumbItem } from '@/types';
import { useMemo } from 'react';
import { extractMultiTimeSeriesData } from '@/utils/dataTransformers'; 
import RateChart from './RateChart';

interface USDLKRRecord {
    record_date: string;
    open_bid: number;
    open_offer: number;
    close_bid: number;
    close_offer: number;
    exchange_house_buying: number;
    exchange_house_average_buy_rate: number;
    money_products_buying: number;
    money_products_average_buy_rate: number;
    ir_buying: number;
    ir_average_buy_rate: number;
    korea: number;
    isrel: number;
    qatar: number;
    uae: number;
    oman: number;
    kuwait: number;
    italy: number;
    saudi_arabia: number;
    jordan: number;
    japan: number;
    cyprus: number;
    inter_bank_buying: number;
    inter_bank_selling: number;
    inter_bank_average_buy_rate: number;
    inter_bank_average_sell_rate: number;
    central_bank_buying: number;
    central_bank_selling: number;
    central_bank_average_buy_rate: number;
    central_bank_average_sell_rate: number;

}

interface USDLKRProps {
    records: USDLKRRecord[];
}


export default function USDLKR({ records }: USDLKRProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'USD/LKR', href: route('usd-lkr.index') },
    ];


    // close_bid, close_offer, 

    const closeRates = useMemo(() => {
        return extractMultiTimeSeriesData(records, ['close_bid', 'close_offer'], { days: 30 });
    }, [records]);





    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="USD/LKR" />
            <div className="flex flex-col gap-6 px-4 py-6">
                <Heading
                    title="USD/LKR Desk"
                    description="All the latest USD/LKR Transactions and statistics."
                />

                {/* Header Stats - 4 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    
                </div>
            </div>
            
        </AppLayout>
    );
};