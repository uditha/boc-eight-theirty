<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorporateDesk extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'record_date',

        // Opening Balance
        'opening_balance_amount',
        'opening_balance_rate',

        // Inflows
        'inflow_other_amount',
        'inflow_other_rate',
        'inflow_corporate_amount',
        'inflow_corporate_rate',
        'inflow_personal_amount',
        'inflow_personal_rate',
        'inflow_fcbu_amount',
        'inflow_fcbu_rate',
        'inflow_pettah_amount',
        'inflow_pettah_rate',
        'inflow_imp_amount',
        'inflow_imp_rate',
        'inflow_exchange_house_amount',
        'inflow_exchange_house_rate',
        'inflow_ir_amount',
        'inflow_ir_rate',
        'inflow_interbank_amount',
        'inflow_interbank_rate',
        'inflow_internal_entries_amount',
        'inflow_internal_entries_rate',

        // Outflows
        'outflow_pettah_amount',
        'outflow_pettah_rate',
        'outflow_others_amount',
        'outflow_others_rate',
        'outflow_tr_amount',
        'outflow_tr_rate',
        'outflow_metro_tr_amount',
        'outflow_metro_tr_rate',
        'outflow_ir_amount',
        'outflow_ir_rate',
        'outflow_nugegoda_amount',
        'outflow_nugegoda_rate',
        'outflow_corporate_amount',
        'outflow_corporate_rate',
        'outflow_personal_amount',
        'outflow_personal_rate',
        'outflow_imp_amount',
        'outflow_imp_rate',
        'outflow_cpc_amount',
        'outflow_cpc_rate',
        'outflow_interbank_amount',
        'outflow_interbank_rate',
        'outflow_internal_entries_amount',
        'outflow_internal_entries_rate',

        // Closing Balance
        'closing_balance_amount',
        'closing_balance_rate',

        // Margins
        'corporate_margin',
        'overall_margin',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'record_date' => 'date',
        'opening_balance_amount' => 'decimal:2',
        'opening_balance_rate' => 'decimal:6',

        // Inflows
        'inflow_other_amount' => 'decimal:2',
        'inflow_other_rate' => 'decimal:6',
        'inflow_corporate_amount' => 'decimal:2',
        'inflow_corporate_rate' => 'decimal:6',
        'inflow_personal_amount' => 'decimal:2',
        'inflow_personal_rate' => 'decimal:6',
        'inflow_fcbu_amount' => 'decimal:2',
        'inflow_fcbu_rate' => 'decimal:6',
        'inflow_pettah_amount' => 'decimal:2',
        'inflow_pettah_rate' => 'decimal:6',
        'inflow_imp_amount' => 'decimal:2',
        'inflow_imp_rate' => 'decimal:6',
        'inflow_exchange_house_amount' => 'decimal:2',
        'inflow_exchange_house_rate' => 'decimal:6',
        'inflow_ir_amount' => 'decimal:2',
        'inflow_ir_rate' => 'decimal:6',
        'inflow_interbank_amount' => 'decimal:2',
        'inflow_interbank_rate' => 'decimal:6',
        'inflow_internal_entries_amount' => 'decimal:2',
        'inflow_internal_entries_rate' => 'decimal:6',

        // Outflows
        'outflow_pettah_amount' => 'decimal:2',
        'outflow_pettah_rate' => 'decimal:6',
        'outflow_others_amount' => 'decimal:2',
        'outflow_others_rate' => 'decimal:6',
        'outflow_tr_amount' => 'decimal:2',
        'outflow_tr_rate' => 'decimal:6',
        'outflow_metro_tr_amount' => 'decimal:2',
        'outflow_metro_tr_rate' => 'decimal:6',
        'outflow_ir_amount' => 'decimal:2',
        'outflow_ir_rate' => 'decimal:6',
        'outflow_nugegoda_amount' => 'decimal:2',
        'outflow_nugegoda_rate' => 'decimal:6',
        'outflow_corporate_amount' => 'decimal:2',
        'outflow_corporate_rate' => 'decimal:6',
        'outflow_personal_amount' => 'decimal:2',
        'outflow_personal_rate' => 'decimal:6',
        'outflow_imp_amount' => 'decimal:2',
        'outflow_imp_rate' => 'decimal:6',
        'outflow_cpc_amount' => 'decimal:2',
        'outflow_cpc_rate' => 'decimal:6',
        'outflow_interbank_amount' => 'decimal:2',
        'outflow_interbank_rate' => 'decimal:6',
        'outflow_internal_entries_amount' => 'decimal:2',
        'outflow_internal_entries_rate' => 'decimal:6',

        'closing_balance_amount' => 'decimal:2',
        'closing_balance_rate' => 'decimal:6',
        'corporate_margin' => 'decimal:6',
        'overall_margin' => 'decimal:6',
    ];

    /**
     * Calculate total inflow amount
     *
     * @return float
     */
    public function getTotalInflowAmountAttribute()
    {
        return $this->inflow_other_amount +
               $this->inflow_corporate_amount +
               $this->inflow_personal_amount +
               $this->inflow_fcbu_amount +
               $this->inflow_pettah_amount +
               $this->inflow_imp_amount +
               $this->inflow_exchange_house_amount +
               $this->inflow_ir_amount +
               $this->inflow_interbank_amount +
               $this->inflow_internal_entries_amount;
    }

    /**
     * Calculate total outflow amount
     *
     * @return float
     */
    public function getTotalOutflowAmountAttribute()
    {
        return $this->outflow_pettah_amount +
               $this->outflow_others_amount +
               $this->outflow_tr_amount +
               $this->outflow_metro_tr_amount +
               $this->outflow_ir_amount +
               $this->outflow_nugegoda_amount +
               $this->outflow_corporate_amount +
               $this->outflow_personal_amount +
               $this->outflow_imp_amount +
               $this->outflow_cpc_amount +
               $this->outflow_interbank_amount +
               $this->outflow_internal_entries_amount;
    }

    /**
     * Calculate weighted average inflow rate
     *
     * @return float
     */
    public function getAverageInflowRateAttribute()
    {
        $totalAmount = $this->total_inflow_amount;
        if ($totalAmount <= 0) {
            return 0;
        }

        $weightedSum =
            ($this->inflow_other_amount * $this->inflow_other_rate) +
            ($this->inflow_corporate_amount * $this->inflow_corporate_rate) +
            ($this->inflow_personal_amount * $this->inflow_personal_rate) +
            ($this->inflow_fcbu_amount * $this->inflow_fcbu_rate) +
            ($this->inflow_pettah_amount * $this->inflow_pettah_rate) +
            ($this->inflow_imp_amount * $this->inflow_imp_rate) +
            ($this->inflow_exchange_house_amount * $this->inflow_exchange_house_rate) +
            ($this->inflow_ir_amount * $this->inflow_ir_rate) +
            ($this->inflow_interbank_amount * $this->inflow_interbank_rate) +
            ($this->inflow_internal_entries_amount * $this->inflow_internal_entries_rate);

        return $weightedSum / $totalAmount;
    }

    /**
     * Calculate weighted average outflow rate
     *
     * @return float
     */
    public function getAverageOutflowRateAttribute()
    {
        $totalAmount = $this->total_outflow_amount;
        if ($totalAmount <= 0) {
            return 0;
        }

        $weightedSum =
            ($this->outflow_pettah_amount * $this->outflow_pettah_rate) +
            ($this->outflow_others_amount * $this->outflow_others_rate) +
            ($this->outflow_tr_amount * $this->outflow_tr_rate) +
            ($this->outflow_metro_tr_amount * $this->outflow_metro_tr_rate) +
            ($this->outflow_ir_amount * $this->outflow_ir_rate) +
            ($this->outflow_nugegoda_amount * $this->outflow_nugegoda_rate) +
            ($this->outflow_corporate_amount * $this->outflow_corporate_rate) +
            ($this->outflow_personal_amount * $this->outflow_personal_rate) +
            ($this->outflow_imp_amount * $this->outflow_imp_rate) +
            ($this->outflow_cpc_amount * $this->outflow_cpc_rate) +
            ($this->outflow_interbank_amount * $this->outflow_interbank_rate) +
            ($this->outflow_internal_entries_amount * $this->outflow_internal_entries_rate);

        return $weightedSum / $totalAmount;
    }
}