<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LiquidityLkrDaily;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLiquidityController extends Controller
{
    public function index()
    {
        $liquidityData = LiquidityLkrDaily::orderBy('record_date', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Liquidity/Index', [
            'liquidityData' => $liquidityData
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Date validation (required and must be unique)
            'record_date' => 'required|date|unique:liquidity_lkr_daily,record_date',

            // Market Liquidity validations (nullable decimals)
            'market_liquidity' => 'nullable|numeric|decimal:0,2',
            'boc_liquidity' => 'nullable|numeric|decimal:0,2',

            // Policy Rates validations (nullable decimals with 4 decimal places)
            'srr' => 'nullable|numeric|decimal:0,4|between:0,100',
            'slfr' => 'nullable|numeric|decimal:0,4|between:0,100',
            'sdfr' => 'nullable|numeric|decimal:0,4|between:0,100',
            'opr' => 'nullable|numeric|decimal:0,4|between:0,100',

            // Market Rates validations (nullable decimals with 4 decimal places)
            'call_rate' => 'nullable|numeric|decimal:0,4|between:0,100',
            'repo_rate' => 'nullable|numeric|decimal:0,4|between:0,100',

            // DST Accounts validations (nullable decimals)
            'dst_current_acc' => 'nullable|numeric|decimal:0,2',
            'dst_fund_mgt_acc' => 'nullable|numeric|decimal:0,2',
            'dst_seven_day' => 'nullable|numeric|decimal:0,2',
            'dst_fd' => 'nullable|numeric|decimal:0,2',

            // Inflows validations (nullable decimals)
            'inflow_interbanks' => 'nullable|numeric|decimal:0,2',
            'inflow_electronic_payments' => 'nullable|numeric|decimal:0,2',
            'inflow_dst_ins' => 'nullable|numeric|decimal:0,2',
            'inflow_tbills' => 'nullable|numeric|decimal:0,2',
            'inflow_tbonds' => 'nullable|numeric|decimal:0,2',
            'inflow_coupons' => 'nullable|numeric|decimal:0,2',

            // Outflows validations (nullable decimals)
            'outflow_interbanks' => 'nullable|numeric|decimal:0,2',
            'outflow_electronic_payments' => 'nullable|numeric|decimal:0,2',
            'outflow_dst_outs' => 'nullable|numeric|decimal:0,2',
            'outflow_tbills' => 'nullable|numeric|decimal:0,2',
            'outflow_tbonds' => 'nullable|numeric|decimal:0,2',

            // DVP and RVP validations (nullable decimals)
            'dvp' => 'nullable|numeric|decimal:0,2',
            'rvp' => 'nullable|numeric|decimal:0,2',

            // Customer repo validations
            'customer_repo_balance' => 'nullable|numeric|decimal:0,2',
            'customer_repo_rate' => 'nullable|numeric|decimal:0,4|between:0,100',
        ]);

        LiquidityLkrDaily::create($validated);

        return redirect()->back()
            ->with('message', 'Liquidity data added successfully');
    }

    public function update(Request $request, LiquidityLkrDaily $liquidity)
    {
        $validated = $request->validate([
            // Date validation (required and must be unique)
            'record_date' => 'required|date|unique:liquidity_lkr_daily,record_date',

            // Market Liquidity validations (nullable decimals)
            'market_liquidity' => 'nullable|numeric|decimal:0,2',
            'boc_liquidity' => 'nullable|numeric|decimal:0,2',

            // Policy Rates validations (nullable decimals with 4 decimal places)
            'srr' => 'nullable|numeric|decimal:0,4|between:0,100',
            'slfr' => 'nullable|numeric|decimal:0,4|between:0,100',
            'sdfr' => 'nullable|numeric|decimal:0,4|between:0,100',
            'opr' => 'nullable|numeric|decimal:0,4|between:0,100',

            // Market Rates validations (nullable decimals with 4 decimal places)
            'call_rate' => 'nullable|numeric|decimal:0,4|between:0,100',
            'repo_rate' => 'nullable|numeric|decimal:0,4|between:0,100',

            // DST Accounts validations (nullable decimals)
            'dst_current_acc' => 'nullable|numeric|decimal:0,2',
            'dst_fund_mgt_acc' => 'nullable|numeric|decimal:0,2',
            'dst_seven_day' => 'nullable|numeric|decimal:0,2',
            'dst_fd' => 'nullable|numeric|decimal:0,2',

            // Inflows validations (nullable decimals)
            'inflow_interbanks' => 'nullable|numeric|decimal:0,2',
            'inflow_electronic_payments' => 'nullable|numeric|decimal:0,2',
            'inflow_dst_ins' => 'nullable|numeric|decimal:0,2',
            'inflow_tbills' => 'nullable|numeric|decimal:0,2',
            'inflow_tbonds' => 'nullable|numeric|decimal:0,2',
            'inflow_coupons' => 'nullable|numeric|decimal:0,2',

            // Outflows validations (nullable decimals)
            'outflow_interbanks' => 'nullable|numeric|decimal:0,2',
            'outflow_electronic_payments' => 'nullable|numeric|decimal:0,2',
            'outflow_dst_outs' => 'nullable|numeric|decimal:0,2',
            'outflow_tbills' => 'nullable|numeric|decimal:0,2',
            'outflow_tbonds' => 'nullable|numeric|decimal:0,2',

            // DVP and RVP validations (nullable decimals)
            'dvp' => 'nullable|numeric|decimal:0,2',
            'rvp' => 'nullable|numeric|decimal:0,2',

            // Customer repo validations
            'customer_repo_balance' => 'nullable|numeric|decimal:0,2',
            'customer_repo_rate' => 'nullable|numeric|decimal:0,4|between:0,100',
        ]);

        $liquidity->update($validated);

        return redirect()->back()
            ->with('message', 'Liquidity data updated successfully');
    }
}
