import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { BreadcrumbItem } from '@/types';
import { useMemo } from 'react';
import RateChart from './RateChart';
import AmountBarChart from './AmountBarChart';
import InterBankTradingChart from './InterBankTradingChart';
import CBSLTradingChart from './CBSLTradingChart';
import CPCSellingChart from './CPCSellingChart';
import BankInflowChart from './BankInflowChart';
import StatCard from '@/components/StatCard';

interface USDLKRRecord {
    record_date: string;
    usd_rate: number;
    exchange_house_buying: number;
    foreign_holding: number;
    money_products_buying: number;
    ir_buying: number;
    inter_bank_buying: number;
    inter_bank_selling: number;
    central_bank_buying: number;
    central_bank_selling: number;
    cpc_selling: number;
}

interface USDLKRProps {
    records: USDLKRRecord[];
}

export default function USDLKR({ records }: USDLKRProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'USD/LKR', href: route('usd-lkr.index') },
    ];

    const usdRateData = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => ({
            date: record.record_date,
            value: record.usd_rate
        }));
    }, [records]);

    const foreignHoldingData = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => ({
            date: record.record_date,
            value: record.foreign_holding
        }));
    }, [records]);

    // Prepare data for CBSL Trading Chart
    const cbslData = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => ({
            record_date: record.record_date,
            cbsl_buying: record.central_bank_buying,
            cbsl_selling: record.central_bank_selling
        }));
    }, [records]);

    // Prepare data for CPC Selling Chart
    const cpcData = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => ({
            record_date: record.record_date,
            cpc_selling: record.cpc_selling
        }));
    }, [records]);

    // Interbank trading data
    const interbankData = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => ({
            date: record.record_date,
            value: (Number(record.inter_bank_buying) || 0) + (Number(record.inter_bank_selling) || 0)
        }));
    }, [records]);

    // CBSL trading volume data
    const cbslVolumeData = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => ({
            date: record.record_date,
            value: (Number(record.central_bank_buying) || 0) + (Number(record.central_bank_selling) || 0)
        }));
    }, [records]);

    // Calculate quick statistics
    const quickStats = useMemo(() => {
        if (!records || !Array.isArray(records) || records.length === 0) {
            return {
                currentRate: 0,
                rateChange: 0,
                rateChangePercent: 0,
                totalForeignHolding: 0,
                totalInterBankVolume: 0,
                totalCBSLVolume: 0
            };
        }

        // Sort records by date to ensure we get the latest and previous data
        const sortedRecords = [...records].sort((a, b) =>
            new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
        );

        const latest = sortedRecords[0];
        const previous = sortedRecords.length > 1 ? sortedRecords[1] : sortedRecords[0];

        const currentRate = Number(latest.usd_rate) || 0;
        const previousRate = Number(previous.usd_rate) || 0;
        const rateChange = currentRate - previousRate;
        const rateChangePercent = previousRate ? (rateChange / previousRate) * 100 : 0;

        const totalForeignHolding = Number(latest.foreign_holding) || 0;
        const totalInterBankVolume = (Number(latest.inter_bank_buying) || 0) + (Number(latest.inter_bank_selling) || 0);
        const totalCBSLVolume = (Number(latest.central_bank_buying) || 0) + (Number(latest.central_bank_selling) || 0);

        return {
            currentRate,
            rateChange,
            rateChangePercent,
            totalForeignHolding,
            totalInterBankVolume,
            totalCBSLVolume
        };
    }, [records]);

    // Helper function to safely format numbers
    const formatNumber = (value: any, decimals = 2) => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(decimals);
    };

    // Helper function to format millions
    const formatMillions = (value: any, decimals = 2) => {
        const num = Number(value);
        return isNaN(num) ? '$0.00M' : `$${(num / 1000000).toFixed(decimals)}M`;
    };

    // Add console log to debug the quickStats values
    console.log('quickStats:', quickStats);
    console.log('formatNumber test:', formatNumber(quickStats.currentRate));
    console.log('formatMillions test:', formatMillions(quickStats.totalForeignHolding));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="USD/LKR" />
            <div className="flex flex-col gap-6 px-4 py-6">
                <Heading
                    title="USD/LKR Exchange Rate"
                    description="View the latest USD/LKR exchange rate data and market activity"
                />

                {/* 4 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        title="Current USD/LKR Rate"
                        data={usdRateData}
                        type="number"
                        decimalPlaces={2}
                        trend={quickStats.rateChange < 0 ? 'down' : 'up'}
                        change={quickStats.rateChange}
                        changePercent={quickStats.rateChangePercent}
                        icon="currency-dollar"
                    />
                    <StatCard
                        title="Foreign Holding"
                        data={foreignHoldingData}
                        type="number"
                        decimalPlaces={2}
                        currency="USD"
                        unit="Mn"
                        icon="chart-bar"
                        className="bg-indigo-50"
                    />
                    <StatCard
                        title="Interbank Volume"
                        data={interbankData}
                        type="number"
                        decimalPlaces={2}
                        currency="USD"
                        unit="Mn"
                        icon="arrows-right-left"
                        className="bg-emerald-50"
                    />
                    <StatCard
                        title="CBSL Trading Volume"
                        data={cbslVolumeData}
                        type="number"
                        decimalPlaces={2}
                        currency="USD"
                        unit="Mn"
                        icon="building-library"
                        className="bg-amber-50"
                    />
                </div>

                {/* Main overview section */}
                {/* <section>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RateChart
                            title="USDLKR Market Rate"
                            data={usdRateData}
                        />
                        <AmountBarChart
                            title='Foreign Holding'
                            data={foreignHoldingData}
                        />
                    </div>
                </section> */}

                {/* Trading activity section */}
                <section className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <InterBankTradingChart
                            title="Interbank Trading Activity"
                            data={records}
                        />
                        <CBSLTradingChart
                            title="CBSL Trading Activity"
                            data={cbslData}
                        />
                    </div>
                </section>

                {/* Bank operations section */}
                <section className="mt-8">
                    <div className="grid grid-cols-1 gap-6">
                        <BankInflowChart
                            title="Bank USD Inflow Methods"
                            data={records}
                        />
                        <CPCSellingChart
                            title="CPC Selling Activity"
                            data={cpcData}
                        />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
};
