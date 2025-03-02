<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('liquidity_lkr_daily', function (Blueprint $table) {
            $table->id();
            $table->date('record_date')->unique();

            // Market Liquidity
            $table->decimal('market_liquidity', 15, 2)->nullable();
            $table->decimal('boc_liquidity', 15, 2)->nullable();

            // Policy Rates
            $table->decimal('srr', 10, 4)->nullable();
            $table->decimal('slfr', 10, 4)->nullable();
            $table->decimal('sdfr', 10, 4)->nullable();
            $table->decimal('opr', 10, 4)->nullable();

            // Market Rates
            $table->decimal('call_rate', 10, 4)->nullable();
            $table->decimal('repo_rate', 10, 4)->nullable();

            // DST Accounts
            $table->decimal('dst_current_acc', 15, 2)->nullable();
            $table->decimal('dst_fund_mgt_acc', 15, 2)->nullable();
            $table->decimal('dst_seven_day', 15, 2)->nullable();
            $table->decimal('dst_fd', 15, 2)->nullable();

            // Inflows
            $table->decimal('inflow_interbanks', 15, 2)->nullable();
            $table->decimal('inflow_electronic_payments', 15, 2)->nullable();
            $table->decimal('inflow_dst_ins', 15, 2)->nullable();
            $table->decimal('inflow_tbills', 15, 2)->nullable();
            $table->decimal('inflow_tbonds', 15, 2)->nullable();
            $table->decimal('inflow_coupons', 15, 2)->nullable();

            // Outflows
            $table->decimal('outflow_interbanks', 15, 2)->nullable();
            $table->decimal('outflow_electronic_payments', 15, 2)->nullable();
            $table->decimal('outflow_dst_outs', 15, 2)->nullable();
            $table->decimal('outflow_tbills', 15, 2)->nullable();
            $table->decimal('outflow_tbonds', 15, 2)->nullable();

            // DVP and RVP
            $table->decimal('dvp', 15, 2)->nullable();
            $table->decimal('rvp', 15, 2)->nullable();

            // Customer repo
            $table->decimal('customer_repo_balance', 15, 2)->nullable();
            $table->decimal('customer_repo_rate', 10, 4)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidity_lkr_daily');
    }
};
