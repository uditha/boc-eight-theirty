<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\LiquidityLkrDaily;
use App\Models\LiqudityFcyDaily;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LiqudityController extends Controller
{
    public function lkr()
    {

        $records = LiquidityLkrDaily::select('*')
            ->orderBy('record_date')
            ->get()
            ->map(function ($record) {
                return [
                    'record_date' => Carbon::parse($record->record_date)->format('Y-m-d'),
                    'market_liquidity' => $record->market_liquidity,
                    'boc_liquidity' => $record->boc_liquidity,
                    'srr' => $record->srr,
                    'slfr' => $record->slfr,
                    'sdfr' => $record->sdfr,
                    'opr' => $record->opr,
                    'call_rate' => $record->call_rate,
                    'repo_rate' => $record->repo_rate,
                    'dst_current_acc' => $record->dst_current_acc,
                    'dst_fund_mgt_acc' => $record->dst_fund_mgt_acc,
                    'dst_seven_day' => $record->dst_seven_day,
                    'dst_fd' => $record->dst_fd,
                    'inflow_interbanks' => $record->inflow_interbanks,
                    'inflow_electronic_payments' => $record->inflow_electronic_payments,
                    'inflow_dst_ins' => $record->inflow_dst_ins,
                    'inflow_tbills' => $record->inflow_tbills,
                    'inflow_tbonds' => $record->inflow_tbonds,
                    'inflow_coupons' => $record->inflow_coupons,
                    'outflow_interbanks' => $record->outflow_interbanks,
                    'outflow_electronic_payments' => $record->outflow_electronic_payments,
                    'outflow_dst_outs' => $record->outflow_dst_outs,
                    'outflow_tbills' => $record->outflow_tbills,
                    'outflow_tbonds' => $record->outflow_tbonds,
                    'dvp' => $record->dvp,
                    'rvp' => $record->rvp,
                    'customer_repo_balance' => $record->customer_repo_balance,
                    'customer_repo_rate' => $record->customer_repo_rate,
                ];
            });

        return Inertia::render('liquidity/lkr/index', [
            'dailyLiqudityData' => $records,
        ]);
    }

    public function fcy()
    {

        $records = LiqudityFcyDaily::select('*')
            ->orderBy('record_date')
            ->get()
            ->map(function ($record) {
                return [
                    'record_date' => Carbon::parse($record->record_date)->format('Y-m-d'),
                    'usd_bal' => $record->usd_bal,
                    'usd_rate' => $record->usd_rate,
                    'eur_bal' => $record->eur_bal,
                    'eur_rate' => $record->eur_rate,
                    'gbp_bal' => $record->gbp_bal,
                    'gbp_rate' => $record->gbp_rate,
                    'aud_bal' => $record->aud_bal,
                    'aud_rate' => $record->aud_rate,
                    'nostro_bal' => $record->nostro_bal,
                    'swaps' => $record->swaps,
                    'swap_cost' => $record->swap_cost,
                    'placement_on' => $record->placement_on,
                    'placement_on_rate' => $record->placement_on_rate,
                    'placement_term' => $record->placement_term,
                    'placement_term_rate' => $record->placement_term_rate,
                    'fcbu_payments' => $record->fcbu_payments,
                    'cpc_payments' => $record->cpc_payments,
                    'import' => $record->import,
                    'pettha' => $record->pettha,
                    'fcbu' => $record->fcbu,
                    'travel' => $record->travel,
                    'branch_import' => $record->branch_import,
                    'usd_unknown_inflows' => $record->usd_unknown_inflows,
                    'sofr' => $record->sofr,
                    'brent' => $record->brent,
                    'nemex' => $record->nemex,
                    'gold' => $record->gold,
                    'fed_fund_rate' => $record->fed_fund_rate,
                    'uk_bank_rate' => $record->uk_bank_rate,
                    'ecb_rate' => $record->ecb_rate,
                    'aus_cash_rate' => $record->aus_cash_rate,
                    'india_repo_rate' => $record->india_repo_rate,
                ];
            });

        return Inertia::render('liquidity/fcy/index', [
            'dailyFCYLiqudityData' => $records,
        ]);
    }
}

