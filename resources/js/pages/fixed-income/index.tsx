import { Head } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { BreadcrumbItem } from '@/types';
import SimpleCashflowView from "./SimpleCashflowView";
import { extractTimeSeriesData } from "@/utils/dataTransformers";
import { useMemo } from "react";
import StatCard from "@/components/StatCard";
// icons for the StatCard component
import { Building2, FileText, Landmark, FileDigit } from 'lucide-react';
import MarketIndicator from '@/components/MarketIndicator';
import YieldCurveAnalysis from './YieldCurveAnalysis';
import PortfolioComposition from './PortfolioComposition';

interface FixedIncomeRecord {
  security: string;
  maturity: string;
  amount: number;
  coupon: string;
  cf_date: string;
  coupon_amount: number;
  capital: number;
}

interface FixedIncomeDailyRecord {
  record_date: string;
  tbill_balance: number;
  tbond_balance: number;
  govt_holding: number;
  tbill_rate_3m: number;
  tbill_rate_6m: number;
  tbill_rate_1y: number;
  tbond_rate_2y: number;
  tbond_rate_3y: number;
  tbond_rate_5y: number;
  tbond_rate_10y: number;
  tbond_rate_15y: number;
  [key: string]: string | number;
}

interface Props {
  fixedIncomeData: FixedIncomeRecord[];
  fixedIncomeDailyData: FixedIncomeDailyRecord[];
}

export default function FixedIncome({ fixedIncomeData, fixedIncomeDailyData }: Props) {
  // breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Fixed Income', href: route('fixed-income.index') },
  ];

  const tbill_balance = useMemo(() =>
    extractTimeSeriesData(fixedIncomeDailyData, 'tbill_balance', {
      days: 14,
      sortDirection: 'asc',
    }),
    [fixedIncomeDailyData]
  );

  const tbond_balance = useMemo(() =>
    extractTimeSeriesData(fixedIncomeDailyData, 'tbond_balance', {
      days: 14,
      sortDirection: 'asc',
    }),
    [fixedIncomeDailyData]
  );
      
  const govtHoldings = useMemo(() =>
    extractTimeSeriesData(fixedIncomeDailyData, 'govt_holding', {
      days: 14,
      sortDirection: 'asc',
    }),
    [fixedIncomeDailyData]
  );

  // Total portfolio value
  const portfolioTotal = useMemo(() => {
    return fixedIncomeDailyData.map(record => ({
      date: record.record_date,
      value: Number(record.tbill_balance || 0) + Number(record.tbond_balance || 0)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14);
  }, [fixedIncomeDailyData]);

  // Get the latest record for portfolio composition data
  const latestRecord = useMemo(() => {
    const sortedRecords = [...fixedIncomeDailyData].sort(
      (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
    );
    return sortedRecords[0];
  }, [fixedIncomeDailyData]);

  // Prepare portfolio composition data for the donut chart
  const portfolioCompositionData = useMemo(() => {
    if (!latestRecord) return [];
    
    return [
      { name: 'T-Bills', value: Number(latestRecord.tbill_balance || 0) },
      { name: 'T-Bonds', value: Number(latestRecord.tbond_balance || 0) }
    ].filter(item => item.value > 0); // Only include non-zero values
  }, [latestRecord]);

  // Interest Rate Metrics for Yield Curve
  const yieldCurveMetrics = [
    {
      key: 'tbill_rate_3m',
      name: '3M T-Bill',
      valueType: 'percentage' as const,
      formatDecimals: 2
    },
    {
      key: 'tbill_rate_6m',
      name: '6M T-Bill',
      valueType: 'percentage' as const,
      formatDecimals: 2
    },
    {
      key: 'tbill_rate_1y',
      name: '1Y T-Bill',
      valueType: 'percentage' as const,
      formatDecimals: 2
    },
    {
      key: 'tbond_rate_2y',
      name: '2Y T-Bond',
      valueType: 'percentage' as const,
      formatDecimals: 2
    },
    {
      key: 'tbond_rate_3y',
      name: '3Y T-Bond',
      valueType: 'percentage' as const,
      formatDecimals: 2
    },
    {
      key: 'tbond_rate_5y',
      name: '5Y T-Bond',
      valueType: 'percentage' as const,
      formatDecimals: 2
    },
    {
      key: 'tbond_rate_10y',
      name: '10Y T-Bond',
      valueType: 'percentage' as const,
      formatDecimals: 2
    },
    {
      key: 'tbond_rate_15y',
      name: '15Y T-Bond',
      valueType: 'percentage' as const,
      formatDecimals: 2
    }
  ];

  const yieldCurveData = useMemo(() => {
    // Transform each metric into the required format for the MarketIndicator
    return yieldCurveMetrics.map(metric => {
      // Get time series data for each metric
      const timeSeriesData = extractTimeSeriesData(fixedIncomeDailyData, metric.key, {
        days: 10,
        sortDirection: 'asc',
      });
  
      return {
        ...metric,
        data: timeSeriesData
      };
    });
  }, [fixedIncomeDailyData, yieldCurveMetrics]);

  // Prepare data for yield curve analysis
  const currentYieldCurve = useMemo(() => {
    if (!latestRecord) return [];
    
    return [
      { tenor: '3M', rate: Number(latestRecord.tbill_rate_3m || 0) },
      { tenor: '6M', rate: Number(latestRecord.tbill_rate_6m || 0) },
      { tenor: '1Y', rate: Number(latestRecord.tbill_rate_1y || 0) },
      { tenor: '2Y', rate: Number(latestRecord.tbond_rate_2y || 0) },
      { tenor: '3Y', rate: Number(latestRecord.tbond_rate_3y || 0) },
      { tenor: '5Y', rate: Number(latestRecord.tbond_rate_5y || 0) },
      { tenor: '10Y', rate: Number(latestRecord.tbond_rate_10y || 0) },
      { tenor: '15Y', rate: Number(latestRecord.tbond_rate_15y || 0) }
    ].filter(item => item.rate > 0); // Only include non-zero values
  }, [latestRecord]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Fixed Income" />
      <div className="flex flex-col gap-6 px-4 py-6">
        <Heading
          title="Fixed Income Dashboard"
          description="Track your fixed income portfolio performance and upcoming cashflows"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Portfolio Total" 
            data={portfolioTotal} 
            type="number"
            currency="LKR"
            unit="Mn"
            decimalPlaces={1}
            change="1W"
            icon={FileDigit}
          />
          <StatCard 
            title="Treasury Bills" 
            data={tbill_balance} 
            type="number"
            currency="LKR"
            unit="Mn"
            decimalPlaces={1}
            change="1W"
            icon={FileText}
          />
          <StatCard 
            title="Treasury Bonds" 
            data={tbond_balance} 
            type="number"
            currency="LKR"
            unit="Mn"
            decimalPlaces={1}
            change="1W"
            icon={Building2}
          />
          <StatCard 
            title="Govt. Holdings" 
            data={govtHoldings}
            type="number"
            currency="LKR"
            unit="Mn"
            decimalPlaces={1}
            change="1W"
            icon={Landmark}
          />
        </div>

        {/* Yield Curve Indicators with sparklines */}
        <div className="w-full">
          <MarketIndicator 
            title="Yield Curve" 
            liquidityData={yieldCurveData}
          />
        </div>

        {/* Two column layout for analysis components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <YieldCurveAnalysis data={currentYieldCurve} />
          <PortfolioComposition 
            data={portfolioTotal} 
            compositionData={portfolioCompositionData} 
          />
        </div>

        {/* Cashflow View */}
        <div className="w-full">
          <SimpleCashflowView fixedIncomeData={fixedIncomeData} />
        </div>
      </div>
    </AppLayout> 
  );
}