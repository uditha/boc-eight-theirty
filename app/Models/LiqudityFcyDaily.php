<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiqudityFcyDaily extends Model
{
    protected $table = 'liqudity_fcy_daily';
    protected $fillable = [
        'record_date',
        'usd_bal',
        'usd_rate',
        'eur_bal',
        'eur_rate',
        'gbp_bal',
        'gbp_rate',
        'aud_bal',
        'aud_rate',
        'nostro_bal',
        'swaps',
        'swap_cost',
        'placement_on',
        'placement_on_rate',
        'placement_term',
        'placement_term_rate',
        'fcbu_payments',
        'cpc_payments',
        'import',
        'pettha',
        'fcbu',
        'travel',
        'branch_import',
        'usd_unknown_inflows',
        'sofr',
        'brent',
        'nemex',
        'gold',
        'fed_fund_rate',
        'uk_bank_rate',
        'ecb_rate',
        'aus_cash_rate',
        'india_repo_rate',
    ];

    protected $casts = [
        'record_date' => 'date',
    ];

}
