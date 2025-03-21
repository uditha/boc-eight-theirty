import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { BreadcrumbItem } from '@/types';
import DailySummaryTable from './DailySummaryTable';
import UnitSelectionComponent from './BuySellAnalysis';
// Define interface for corporate desk data
interface CorporateDesk {
  id: number;
  record_date: string;

  // Opening Balance
  opening_balance_amount: number;
  opening_balance_rate: number;

  // Inflows with rates
  inflow_other_amount: number;
  inflow_other_rate: number;
  inflow_corporate_amount: number;
  inflow_corporate_rate: number;
  inflow_personal_amount: number;
  inflow_personal_rate: number;
  inflow_fcbu_amount: number;
  inflow_fcbu_rate: number;
  inflow_pettah_amount: number;
  inflow_pettah_rate: number;
  inflow_imp_amount: number;
  inflow_imp_rate: number;
  inflow_exchange_house_amount: number;
  inflow_exchange_house_rate: number;
  inflow_ir_amount: number;
  inflow_ir_rate: number;
  inflow_interbank_amount: number;
  inflow_interbank_rate: number;
  inflow_internal_entries_amount: number;
  inflow_internal_entries_rate: number;

  // Outflows with rates
  outflow_pettah_amount: number;
  outflow_pettah_rate: number;
  outflow_others_amount: number;
  outflow_others_rate: number;
  outflow_tr_amount: number;
  outflow_tr_rate: number;
  outflow_metro_tr_amount: number;
  outflow_metro_tr_rate: number;
  outflow_ir_amount: number;
  outflow_ir_rate: number;
  outflow_nugegoda_amount: number;
  outflow_nugegoda_rate: number;
  outflow_corporate_amount: number;
  outflow_corporate_rate: number;
  outflow_personal_amount: number;
  outflow_personal_rate: number;
  outflow_imp_amount: number;
  outflow_imp_rate: number;
  outflow_cpc_amount: number;
  outflow_cpc_rate: number;
  outflow_interbank_amount: number;
  outflow_interbank_rate: number;
  outflow_internal_entries_amount: number;
  outflow_internal_entries_rate: number;

  // Closing Balance
  closing_balance_amount: number;
  closing_balance_rate: number;

  // Margins
  corporate_margin: number;
  overall_margin: number;
}

export default function Corporate({ records }: { records: CorporateDesk[] }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Corporate', href: route('corporate.index') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Corporate Desk Dashboard" />
      <div className="container mx-auto px-4 py-8">
        <Heading>Corporate Desk Dashboard</Heading>

        <div className="mt-6">
          <DailySummaryTable records={records} />
        </div>
        <div className="mt-6">
          <UnitSelectionComponent records={records} />
        </div>
      </div>
    </AppLayout>
  );
}