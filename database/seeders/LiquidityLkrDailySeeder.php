<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LiquidityLkrDailySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Start date: December 31, 2024
        // End date: Today (March 4, 2025)
        $startDate = Carbon::create(2024, 12, 31);
        $endDate = Carbon::today();

        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            // Skip weekends
            if ($currentDate->isWeekday()) {
                $this->seedDailyData($currentDate);
            }

            $currentDate->addDay();
        }
    }

    /**
     * Seed data for a specific date
     */
    private function seedDailyData(Carbon $date): void
    {
        // Generate random data within realistic ranges
        $marketLiquidity = $this->randomDecimal(-100000, 100000, 2);
        $bocLiquidity = $this->randomDecimal(-50000, 50000, 2);

        DB::table('liquidity_lkr_daily')->insert([
            'record_date' => $date->format('Y-m-d'),

            // Market Liquidity
            'market_liquidity' => $marketLiquidity,
            'boc_liquidity' => $bocLiquidity,

            // Policy Rates
            'srr' => $this->randomDecimal(4, 5, 2),
            'slfr' => $this->randomDecimal(9, 9.5, 2),
            'sdfr' => $this->randomDecimal(7, 7.5, 2),
            'opr' => $this->randomDecimal(8, 8.5, 2),

            // Market Rates - Using current rates as baseline
            'call_rate' => $this->randomDecimal(7.9, 8.1, 2), // Current: 8.00
            'repo_rate' => $this->randomDecimal(8.05, 8.15, 2), // Current: 8.10
            'awplr' => $this->randomDecimal(10.5, 11.5, 2),
            'awplr_boc' => $this->randomDecimal(10, 11, 2),
            'awdr' => $this->randomDecimal(7, 7.5, 2),
            'awfdr' => $this->randomDecimal(8, 8.5, 2),
            'awndr' => $this->randomDecimal(9.5, 10.5, 2),

            // DST Accounts
            'dst_current_acc' => $this->randomDecimal(10000, 30000, 2),
            'dst_fund_mgt_acc' => $this->randomDecimal(50000, 100000, 2),
            'dst_seven_day' => $this->randomDecimal(20000, 40000, 2),
            'dst_fd' => $this->randomDecimal(60000, 120000, 2),

            // Inflows
            'inflow_interbanks' => $this->randomDecimal(5000, 15000, 2),
            'inflow_electronic_payments' => $this->randomDecimal(10000, 25000, 2),
            'inflow_dst_ins' => $this->randomDecimal(2000, 8000, 2),
            'inflow_tbills' => $this->randomDecimal(15000, 30000, 2),
            'inflow_tbonds' => $this->randomDecimal(10000, 20000, 2),
            'inflow_coupons' => $this->randomDecimal(5000, 12000, 2),

            // Outflows
            'outflow_interbanks' => $this->randomDecimal(5000, 15000, 2),
            'outflow_electronic_payments' => $this->randomDecimal(12000, 28000, 2),
            'outflow_dst_outs' => $this->randomDecimal(2000, 8000, 2),
            'outflow_tbills' => $this->randomDecimal(15000, 32000, 2),
            'outflow_tbonds' => $this->randomDecimal(10000, 22000, 2),

            // DVP and RVP
            'dvp' => $this->randomDecimal(25000, 50000, 2),
            'rvp' => $this->randomDecimal(25000, 50000, 2),

            // Customer repo
            'customer_repo_balance' => $this->randomDecimal(10000, 30000, 2),
            'customer_repo_rate' => $this->randomDecimal(7.8, 8.3, 2), // Aligned with repo rate

            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Generate a random decimal value within a range with specified precision
     */
    private function randomDecimal(float $min, float $max, int $precision): float
    {
        $scale = pow(10, $precision);
        $randomValue = mt_rand($min * $scale, $max * $scale) / $scale;

        return round($randomValue, $precision);
    }
}