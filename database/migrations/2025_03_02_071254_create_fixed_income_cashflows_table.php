<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fixed_income_cashflows', function (Blueprint $table) {
            $table->id();
            $table->string('security');
            $table->date('maturity');
            $table->decimal('amount', 20, 2);
            $table->string('coupon');
            $table->date('cf_date');
            $table->decimal('coupon_amount', 20, 2)->nullable();
            $table->decimal('capital', 20, 2);
            $table->timestamps();

            $table->index('security');
            $table->index('maturity');
            $table->index('cf_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixed_income_cashflows');
    }
};
