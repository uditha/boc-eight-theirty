<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiquidityLkrDaily extends Model
{
    protected $table = 'liquidity_lkr_daily';

    protected $fillable = [
        'record_date',
        'market_liquidity',
        'boc_liquidity',
        'srr',
        'slfr',
        'sdfr',
        'opr',
        'call_rate',
        'repo_rate',
        'awplr',
        'awplr_boc',
        'awdr',
        'awfdr',
        'awndr',
        'dst_current_acc',
        'dst_fund_mgt_acc',
        'dst_seven_day',
        'dst_fd',
        'inflow_interbanks',
        'inflow_electronic_payments',
        'inflow_dst_ins',
        'inflow_tbills',
        'inflow_tbonds',
        'inflow_coupons',
        'outflow_interbanks',
        'outflow_electronic_payments',
        'outflow_dst_outs',
        'outflow_tbills',
        'outflow_tbonds',
        'dvp',
        'rvp',
        'customer_repo_balance',
        'customer_repo_rate',
    ];

    protected $casts = [
        'record_date' => 'date',
    ];
}
