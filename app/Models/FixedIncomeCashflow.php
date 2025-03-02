<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixedIncomeCashflow extends Model
{
    protected $fillable = [
        'security',
        'maturity',
        'amount',
        'coupon',
        'cf_date',
        'coupon_amount',
        'capital',
    ];

    protected $casts = [
        'maturity' => 'date',
        'cf_date' => 'date',
        'amount' => 'decimal:2',
        'coupon_amount' => 'decimal:2',
        'capital' => 'decimal:2',
    ];

}
