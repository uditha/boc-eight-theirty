<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\CorporateDesk;
use Illuminate\Support\Facades\DB;


class CorporateDeskController extends Controller
{
    public function index()
    {

        // // Opening Balance
        // 'opening_balance_amount',
        // 'opening_balance_rate',

        // // Inflows
        // 'inflow_other_amount',
        // 'inflow_other_rate',
        // 'inflow_corporate_amount',
        // 'inflow_corporate_rate',
        // 'inflow_personal_amount',
        // 'inflow_personal_rate',
        // 'inflow_fcbu_amount',
        // 'inflow_fcbu_rate',
        // 'inflow_pettah_amount',
        // 'inflow_pettah_rate',
        // 'inflow_imp_amount',
        // 'inflow_imp_rate',
        // 'inflow_exchange_house_amount',
        // 'inflow_exchange_house_rate',
        // 'inflow_ir_amount',
        // 'inflow_ir_rate',
        // 'inflow_interbank_amount',
        // 'inflow_interbank_rate',
        // 'inflow_internal_entries_amount',
        // 'inflow_internal_entries_rate',

        // // Outflows
        // 'outflow_pettah_amount',
        // 'outflow_pettah_rate',
        // 'outflow_others_amount',
        // 'outflow_others_rate',
        // 'outflow_tr_amount',
        // 'outflow_tr_rate',
        // 'outflow_metro_tr_amount',
        // 'outflow_metro_tr_rate',
        // 'outflow_ir_amount',
        // 'outflow_ir_rate',
        // 'outflow_nugegoda_amount',
        // 'outflow_nugegoda_rate',
        // 'outflow_corporate_amount',
        // 'outflow_corporate_rate',
        // 'outflow_personal_amount',
        // 'outflow_personal_rate',
        // 'outflow_imp_amount',
        // 'outflow_imp_rate',
        // 'outflow_cpc_amount',
        // 'outflow_cpc_rate',
        // 'outflow_interbank_amount',
        // 'outflow_interbank_rate',
        // 'outflow_internal_entries_amount',
        // 'outflow_internal_entries_rate',

        // // Closing Balance
        // 'closing_balance_amount',
        // 'closing_balance_rate',

        // // Margins
        // 'corporate_margin',
        // 'overall_margin',

        $records = CorporateDesk::select('*')
            ->orderBy('record_date')
            ->get()
            ->map(function ($record) {
                return [
                    'record_date' => Carbon::parse($record->record_date)->format('Y-m-d'),
                    'opening_balance_amount' => $record->opening_balance_amount,
                    'opening_balance_rate' => $record->opening_balance_rate,
                    'inflow_other_amount' => $record->inflow_other_amount,
                    'inflow_other_rate' => $record->inflow_other_rate,
                    'inflow_corporate_amount' => $record->inflow_corporate_amount,
                    'inflow_corporate_rate' => $record->inflow_corporate_rate,
                    'inflow_personal_amount' => $record->inflow_personal_amount,
                    'inflow_personal_rate' => $record->inflow_personal_rate,
                    'inflow_fcbu_amount' => $record->inflow_fcbu_amount,
                    'inflow_fcbu_rate' => $record->inflow_fcbu_rate,
                    'inflow_pettah_amount' => $record->inflow_pettah_amount,
                    'inflow_pettah_rate' => $record->inflow_pettah_rate,
                    'inflow_imp_amount' => $record->inflow_imp_amount,
                    'inflow_imp_rate' => $record->inflow_imp_rate,
                    'inflow_exchange_house_amount' => $record->inflow_exchange_house_amount,
                    'inflow_exchange_house_rate' => $record->inflow_exchange_house_rate,
                    'inflow_ir_amount' => $record->inflow_ir_amount,
                    'inflow_ir_rate' => $record->inflow_ir_rate,
                    'inflow_interbank_amount' => $record->inflow_interbank_amount,
                    'inflow_interbank_rate' => $record->inflow_interbank_rate,
                    'inflow_internal_entries_amount' => $record->inflow_internal_entries_amount,
                    'inflow_internal_entries_rate' => $record->inflow_internal_entries_rate,
                    'outflow_pettah_amount' => $record->outflow_pettah_amount,
                    'outflow_pettah_rate' => $record->outflow_pettah_rate,
                    'outflow_others_amount' => $record->outflow_others_amount,
                    'outflow_others_rate' => $record->outflow_others_rate,
                    'outflow_tr_amount' => $record->outflow_tr_amount,
                    'outflow_tr_rate' => $record->outflow_tr_rate,
                    'outflow_metro_tr_amount' => $record->outflow_metro_tr_amount,
                    'outflow_metro_tr_rate' => $record->outflow_metro_tr_rate,
                    'outflow_ir_amount' => $record->outflow_ir_amount,
                    'outflow_ir_rate' => $record->outflow_ir_rate,
                    'outflow_nugegoda_amount' => $record->outflow_nugegoda_amount,
                    'outflow_nugegoda_rate' => $record->outflow_nugegoda_rate,
                    'outflow_corporate_amount' => $record->outflow_corporate_amount,
                    'outflow_corporate_rate' => $record->outflow_corporate_rate,
                    'outflow_personal_amount' => $record->outflow_personal_amount,
                    'outflow_personal_rate' => $record->outflow_personal_rate,
                    'outflow_imp_amount' => $record->outflow_imp_amount,
                    'outflow_imp_rate' => $record->outflow_imp_rate,
                    'outflow_cpc_amount' => $record->outflow_cpc_amount,
                    'outflow_cpc_rate' => $record->outflow_cpc_rate,
                    'outflow_interbank_amount' => $record->outflow_interbank_amount,
                    'outflow_interbank_rate' => $record->outflow_interbank_rate,
                    'outflow_internal_entries_amount' => $record->outflow_internal_entries_amount,
                    'outflow_internal_entries_rate' => $record->outflow_internal_entries_rate,
                    'closing_balance_amount' => $record->closing_balance_amount,
                    'closing_balance_rate' => $record->closing_balance_rate,
                    'corporate_margin' => $record->corporate_margin,
                    'overall_margin' => $record->overall_margin,
                ];
            });

        return Inertia::render('corporate/index', [
            'records' => $records
        ]);


    }


}
