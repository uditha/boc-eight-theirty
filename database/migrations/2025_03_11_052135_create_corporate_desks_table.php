<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('corporate_desks', function (Blueprint $table) {
            $table->id();
            $table->date('record_date');

            // Opening Balance
            $table->decimal('opening_balance_amount', 15, 2)->default(0);
            $table->decimal('opening_balance_rate', 10, 6)->default(0);

            // Inflows
            $table->decimal('inflow_other_amount', 15, 2)->default(0);
            $table->decimal('inflow_other_rate', 10, 6)->default(0);

            $table->decimal('inflow_corporate_amount', 15, 2)->default(0);
            $table->decimal('inflow_corporate_rate', 10, 6)->default(0);

            $table->decimal('inflow_personal_amount', 15, 2)->default(0);
            $table->decimal('inflow_personal_rate', 10, 6)->default(0);

            $table->decimal('inflow_fcbu_amount', 15, 2)->default(0);
            $table->decimal('inflow_fcbu_rate', 10, 6)->default(0);

            $table->decimal('inflow_pettah_amount', 15, 2)->default(0);
            $table->decimal('inflow_pettah_rate', 10, 6)->default(0);

            $table->decimal('inflow_imp_amount', 15, 2)->default(0);
            $table->decimal('inflow_imp_rate', 10, 6)->default(0);

            $table->decimal('inflow_exchange_house_amount', 15, 2)->default(0);
            $table->decimal('inflow_exchange_house_rate', 10, 6)->default(0);

            $table->decimal('inflow_ir_amount', 15, 2)->default(0);
            $table->decimal('inflow_ir_rate', 10, 6)->default(0);

            $table->decimal('inflow_interbank_amount', 15, 2)->default(0);
            $table->decimal('inflow_interbank_rate', 10, 6)->default(0);

            $table->decimal('inflow_internal_entries_amount', 15, 2)->default(0);
            $table->decimal('inflow_internal_entries_rate', 10, 6)->default(0);

            // Outflows
            $table->decimal('outflow_pettah_amount', 15, 2)->default(0);
            $table->decimal('outflow_pettah_rate', 10, 6)->default(0);

            $table->decimal('outflow_others_amount', 15, 2)->default(0);
            $table->decimal('outflow_others_rate', 10, 6)->default(0);

            $table->decimal('outflow_tr_amount', 15, 2)->default(0);
            $table->decimal('outflow_tr_rate', 10, 6)->default(0);

            $table->decimal('outflow_metro_tr_amount', 15, 2)->default(0);
            $table->decimal('outflow_metro_tr_rate', 10, 6)->default(0);

            $table->decimal('outflow_ir_amount', 15, 2)->default(0);
            $table->decimal('outflow_ir_rate', 10, 6)->default(0);

            $table->decimal('outflow_nugegoda_amount', 15, 2)->default(0);
            $table->decimal('outflow_nugegoda_rate', 10, 6)->default(0);

            $table->decimal('outflow_corporate_amount', 15, 2)->default(0);
            $table->decimal('outflow_corporate_rate', 10, 6)->default(0);

            $table->decimal('outflow_personal_amount', 15, 2)->default(0);
            $table->decimal('outflow_personal_rate', 10, 6)->default(0);

            $table->decimal('outflow_imp_amount', 15, 2)->default(0);
            $table->decimal('outflow_imp_rate', 10, 6)->default(0);

            $table->decimal('outflow_cpc_amount', 15, 2)->default(0);
            $table->decimal('outflow_cpc_rate', 10, 6)->default(0);

            $table->decimal('outflow_interbank_amount', 15, 2)->default(0);
            $table->decimal('outflow_interbank_rate', 10, 6)->default(0);

            $table->decimal('outflow_internal_entries_amount', 15, 2)->default(0);
            $table->decimal('outflow_internal_entries_rate', 10, 6)->default(0);

            // Closing Balance
            $table->decimal('closing_balance_amount', 15, 2)->default(0);
            $table->decimal('closing_balance_rate', 10, 6)->default(0);

            // Margins
            $table->decimal('corporate_margin', 10, 6)->default(0);
            $table->decimal('overall_margin', 10, 6)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('corporate_desks');
    }
};
