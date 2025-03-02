<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixedIncomeDaily extends Model
{
    protected $table = 'fixed_income_daily';

    protected $fillable = [
        'record_date',
        'tbill_balance',
        'tbond_balance',
        'govt_holding',
        'tbill_rate_3m',
        'tbill_rate_6m',
        'tbill_rate_1y',
        'tbond_rate_2y',
        'tbond_rate_3y',
        'tbond_rate_5y',
        'tbond_rate_10y',
        'tbond_rate_15y',
    ];

    protected $casts = [
        'record_date' => 'date',
    ];
}
