import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { BreadcrumbItem } from '@/types';
import { useMemo } from 'react';
import { extractTimeSeriesData } from '@/utils/dataTransformers';
import StatCard from '@/components/StatCard';
import { Wallet2, Vault, Landmark, Handshake } from 'lucide-react';
import MarketIndicator from '@/components/MarketIndicator';
import RepoAnalysis from './RepoAnalysis';
import DSTAnalysis from './DSTAnalysis';
import LKRCashFlows from './LKRCashFlows';

interface LiquidityRecord {
    record_date: string;
    market_liquidity: number;
    boc_liquidity: number;
    srr: number;
    slfr: number;
    sdfr: number;
    opr: number;
    call_rate: number;
    repo_rate: number;
    dst_current_acc: number;
    dst_fund_mgt_acc: number;
    dst_seven_day: number;
    dst_fd: number;
    inflow_interbanks: number;
    inflow_electronic_payments: number;
    inflow_dst_ins: number;
    inflow_tbills: number;
    inflow_tbonds: number;
    inflow_coupons: number;
    outflow_interbanks: number;
    outflow_electronic_payments: number;
    outflow_dst_outs: number;
    outflow_tbills: number;
    outflow_tbonds: number;
    dvp: number;
    rvp: number;
    customer_repo_balance: number;
    customer_repo_rate: number;
    [key: string]: string | number;
}

interface Props {
    dailyLiqudityData: LiquidityRecord[];
}

export default function LiquidityLKR({ dailyLiqudityData }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Liquidity', href: route('liquidity.lkr') },
        { title: 'LKR', href: route('liquidity.lkr') },
    ];

    const marketLiquidityData = useMemo(() =>
        extractTimeSeriesData(dailyLiqudityData, 'market_liquidity', {
            days: 10,
            sortDirection: 'asc',
        }),
        [dailyLiqudityData]
    );

    const bocLiquidityData = useMemo(() =>
        extractTimeSeriesData(dailyLiqudityData, 'boc_liquidity', {
            days: 10,
            sortDirection: 'asc',
        }),
        [dailyLiqudityData]
    );

    // DST balance totals
    const dstBalanceData = useMemo(() => {
        return dailyLiqudityData.map(record => ({
            date: record.record_date,
            value: Number(record.dst_current_acc || 0) +
                   Number(record.dst_fund_mgt_acc || 0) +
                   Number(record.dst_seven_day || 0) +
                   Number(record.dst_fd || 0)
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-10);
    }, [dailyLiqudityData]);

    
    // Get the latest record for DST composition data
    const latestRecord = useMemo(() => {
        const sortedRecords = [...dailyLiqudityData].sort(
            (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
        );
        return sortedRecords[0];
    }, [dailyLiqudityData]);

    // Prepare DST composition data for the donut chart
    const dstCompositionData = useMemo(() => {
        if (!latestRecord) return [];
        
        return [
            { name: 'Current Account', value: Number(latestRecord.dst_current_acc || 0) },
            { name: 'Fund Management', value: Number(latestRecord.dst_fund_mgt_acc || 0) },
            { name: 'Seven Day', value: Number(latestRecord.dst_seven_day || 0) },
            { name: 'Fixed Deposit', value: Number(latestRecord.dst_fd || 0) }
        ].filter(item => item.value > 0); // Only include non-zero values
    }, [latestRecord]);

    // Customer Repo Balance
    const customerRepoBalanceData = useMemo(() =>
        extractTimeSeriesData(dailyLiqudityData, 'customer_repo_balance', {
            days: 14,
            sortDirection: 'asc',
        }),
        [dailyLiqudityData]
    );

    // Customer Repo Balance and the Repo Rate
    const repoData = useMemo(() => {
        return dailyLiqudityData.map(record => ({
            date: record.record_date,
            value: record.customer_repo_balance,
            rate: record.customer_repo_rate
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30);
    }, [dailyLiqudityData]);


    // cashflows

    // Data preparation function for index page
    const prepareCashFlowData = (dailyLiquidityData) => {
        return dailyLiquidityData
            .map(record => ({
                date: record.record_date,
                // Inflows
                inflow_interbanks: Number(record.inflow_interbanks || 0),
                inflow_electronic_payments: Number(record.inflow_electronic_payments || 0),
                inflow_dst_ins: Number(record.inflow_dst_ins || 0),
                inflow_tbills: Number(record.inflow_tbills || 0),
                inflow_tbonds: Number(record.inflow_tbonds || 0),
                inflow_coupons: Number(record.inflow_coupons || 0),
                dvp: Number(record.dvp || 0),
                // Outflows
                outflow_interbanks: Number(record.outflow_interbanks || 0),
                outflow_electronic_payments: Number(record.outflow_electronic_payments || 0),
                outflow_dst_outs: Number(record.outflow_dst_outs || 0),
                outflow_tbills: Number(record.outflow_tbills || 0),
                outflow_tbonds: Number(record.outflow_tbonds || 0),
                rvp: Number(record.rvp || 0)
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

  
    // Interest Rate Metrics
    const interestRateMetrics = [
        {
            key: 'srr',
            name: 'SRR',
            valueType: 'percentage' as const,
            formatDecimals: 2
        },
        {
            key: 'slfr',
            name: 'SLFR',
            valueType: 'percentage' as const,
            formatDecimals: 2
        },
        {
            key: 'sdfr',
            name: 'SDFR',
            valueType: 'percentage' as const,
            formatDecimals: 2
        },
        {
            key: 'opr',
            name: 'OPR',
            valueType: 'percentage' as const,
            formatDecimals: 2
        },
        {
            key: 'call_rate',
            name: 'Call Rate',
            valueType: 'percentage' as const,
            formatDecimals: 2
        },
        {
            key: 'repo_rate',
            name: 'Repo Rate',
            valueType: 'percentage' as const,
            formatDecimals: 2
        }
    ];

    const marketRatesData = useMemo(() => {
        // Transform each metric into the required format for the updated MarketIndicator
        return interestRateMetrics.map(metric => {
            // Get time series data for each metric
            const timeSeriesData = extractTimeSeriesData(dailyLiqudityData, metric.key, {
                days: 10,
                sortDirection: 'asc',
            });
    
            return {
                ...metric,
                data: timeSeriesData
            };
        });
    }, [dailyLiqudityData, interestRateMetrics]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="LKR Liquidity" />
            <div className="flex flex-col gap-6 px-4 py-6">
                <Heading
                    title="LKR Liquidity Dashboard"
                    description="View the latest liquidity data for the LKR market"
                />

                {/* Header Stats - 4 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        title="Market Liquidity" 
                        data={marketLiquidityData} 
                        type='number'
                        decimalPlaces={1}
                        currency="LKR"
                        unit="Mn"
                        change='1M'
                        icon={Vault}
                    />
                    <StatCard 
                        title="BOC Liquidity" 
                        data={bocLiquidityData} 
                        type='number'
                        decimalPlaces={1}
                        currency="LKR"
                        unit="Mn"
                        change='1W'
                        icon={Wallet2}
                    />
                    <StatCard 
                        title="DST Balance" 
                        data={dstBalanceData} 
                        type='number'
                        decimalPlaces={1}
                        currency="LKR"
                        unit="Mn"
                        change='1M'
                        icon={Landmark}
                    />
                    <StatCard 
                        title="Repo Borrowings" 
                        data={customerRepoBalanceData} 
                        type='number'
                        decimalPlaces={1}
                        currency="LKR"
                        unit="Mn"
                        change='1W'
                        icon={Handshake}
                    />
                </div>

                {/* Market Rates Indicator with sparklines */}
                <div className="w-full">
                    <MarketIndicator 
                        title="Market Rates" 
                        liquidityData={marketRatesData}
                    />
                </div>

                {/* two col */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RepoAnalysis data={repoData} />
                    <DSTAnalysis 
                        data={dstBalanceData} 
                        compositionData={dstCompositionData} 
                    />
                </div>

                {/* Cashflows */}
                <div className="w-full">
                    <LKRCashFlows data={prepareCashFlowData(dailyLiqudityData)} />
                </div>

            </div>
        </AppLayout>
    );
}