import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { extractMultiTimeSeriesData, extractTimeSeriesData } from '@/utils/dataTransformers';
import BankFCYLiquidity from './BankFCYLiquidity';
import StatCardWithRate from '@/components/StatCardWithRate';
import StatCard from '@/components/StatCard';
import RateCard from './RateCard';
import MarketIndicator from '@/components/MarketIndicator';
import Heading from '@/components/heading';
import USDPayments from './USDPayments';

interface FCYLiquidityRecord {
    record_date: string;
    usd_bal: number;
    usd_rate: number;
    eur_bal: number;
    eur_rate: number;
    gbp_bal: number;
    gbp_rate: number;
    aud_bal: number;
    aud_rate: number;
    nostro_bal: number;
    swaps: number;
    swap_cost: number;
    placement_on: number;
    placement_on_rate: number;
    placement_term: number;
    placement_term_rate: number;
    fcbu_payments: number;
    cpc_payments: number;
    import: number;
    pettha: number;
    fcbu: number;
    travel: number;
    branch_import: number;
    usd_unknown_inflows: number;
    sofr: number;
    brent: number;
    nemex: number;
    gold: number;
    fed_fund_rate: number;
    uk_bank_rate: number;
    ecb_rate: number;
    aus_cash_rate: number;
    india_repo_rate: number;
    japan_rate: number;
    china_rate: number;
    [key: string]: string | number;
}

interface Props {
    dailyFCYLiqudityData: FCYLiquidityRecord[];
}

export default function LiquidityFCY({ dailyFCYLiqudityData }: Props) {
    // breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Liquidity', href: route('liquidity.lkr') },
        { title: 'Foreing Currency', href: route('liquidity.fcy') },
    ];

    const bankFcyLiquidityAndRates = useMemo(() =>
        extractMultiTimeSeriesData(
            dailyFCYLiqudityData,
            [
                'usd_bal',
                'usd_rate',
                'eur_bal',
                'eur_rate',
                'gbp_bal',
                'gbp_rate',
                'aud_bal',
                'aud_rate'
            ],
            {
                days: 30,
                sortDirection: 'asc',
            }
        ),
        [dailyFCYLiqudityData]
    );

    // Transform data for StatCardWithRate component
    const placementOnData = useMemo(() => {
        const placementData = dailyFCYLiqudityData
            .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
            .map(record => ({
                date: record.record_date,
                value: record.placement_on,
                rate: record.placement_on_rate
            }));
        
        return placementData.slice(-14); // Get last 14 days
    }, [dailyFCYLiqudityData]);

    const placementTermData = useMemo(() => {
        const placementData = dailyFCYLiqudityData
            .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
            .map(record => ({
                date: record.record_date,
                value: record.placement_term,
                rate: record.placement_term_rate
            }));
        
        return placementData.slice(-14); // Get last 14 days
    }, [dailyFCYLiqudityData]);

    // nostro balance data
    const nostroBalanceData = useMemo(() =>
            extractTimeSeriesData(dailyFCYLiqudityData, 'nostro_bal', {
                days: 30,
                sortDirection: 'asc',
            }),
            [dailyFCYLiqudityData]
        );

    // usd unknown inflows
    const usdUnknownInflowsData = useMemo(() =>
            extractTimeSeriesData(dailyFCYLiqudityData, 'usd_unknown_inflows', {
                days: 30,
                sortDirection: 'asc',
            }),
            [dailyFCYLiqudityData]
        );
    
    // Prepare market metrics in the format expected by MarketIndicator
    const marketMetrics = useMemo(() => [
        {
            key: 'sofr',
            name: 'SOFR',
            valueType: 'percentage' as const,
            formatDecimals: 2
        },
        {
            key: 'brent',
            name: 'Brent',
            valueType: 'currency' as const,
            unit: '$',
            formatDecimals: 2
        },
        {
            key: 'nemex',
            name: 'Nemex',
            valueType: 'number' as const,
            formatDecimals: 2
        },
        {
            key: 'gold',
            name: 'Gold',
            valueType: 'currency' as const,
            unit: '$',
            formatDecimals: 2
        },
        {
            key: 'fed_fund_rate',
            name: 'Fed Fund Rate',
            valueType: 'percentage' as const,
            formatDecimals: 2
        },
        {
            key: 'uk_bank_rate',
            name: 'UK Bank Rate',
            valueType: 'percentage' as const,
            formatDecimals: 2
        }
    ], []);

    // Prepare market data in the format expected by the updated MarketIndicator
    const marketRatesData = useMemo(() => {
        return marketMetrics.map(metric => {
            // Get time series data for each metric
            const timeSeriesData = extractTimeSeriesData(dailyFCYLiqudityData, metric.key, {
                days: 10,
                sortDirection: 'asc',
            });
            
            return {
                ...metric,
                data: timeSeriesData
            };
        });
    }, [dailyFCYLiqudityData, marketMetrics]);
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FCY Liquidity" />
            <div className="flex flex-col gap-6 px-4 py-6">

                <div className="grid grid-cols-1 gap-6">
                    <MarketIndicator
                        title="FCY Market Indicators"
                        liquidityData={marketRatesData}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BankFCYLiquidity data={bankFcyLiquidityAndRates} />
                    <RateCard />
                </div>
                <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCardWithRate
                                title="Placement On"
                                data={placementOnData}
                                currency="USD"
                                type="number"
                                decimalPlaces={1}
                                rateUnit="%"
                                change="1W"
                            />
                            <StatCardWithRate
                                title="Placement Term"
                                data={placementTermData}
                                currency="USD"
                                type="number"
                                decimalPlaces={1}
                                rateUnit="%"
                                change="1W"
                            />
                            <StatCard 
                                title="Daily Nostro Balance" 
                                data={nostroBalanceData} 
                                type='number'
                                decimalPlaces={1}
                                currency="LKR"
                                unit="Mn"
                                change='1W'
                                
                            />
                            <StatCard 
                                title="X USD Inflows" 
                                data={usdUnknownInflowsData} 
                                type='number'
                                decimalPlaces={1}
                                currency="LKR"
                                unit="Mn"
                                change='1W'
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <USDPayments 
                            data={dailyFCYLiqudityData}
                            title="Bank USD Payments"
                            description="Analysis of USD payments by department"
                        />
                    </div>
            </div>
        </AppLayout>
    );
}