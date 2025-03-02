<?php

namespace Database\Seeders;

use App\Models\LiquidityLkrDaily;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LiquidityLkrDailySeeder extends Seeder
{
    /**
     * Run the database seeds to populate liquidity_lkr_daily table with year-to-date data.
     * Values are stored in millions.
     */
    public function run(): void
    {
        // Get the date range (Jan 1st of current year to today)
        $startDate = Carbon::create(now()->year, 1, 1);
        $endDate = Carbon::today();

        // Initialize some base values for trend generation (in millions)
        $marketLiquidity = rand(-50000, 50000); // Starting value between -50,000M and 50,000M
        $bocLiquidity = rand(10000, 30000); // Starting value between 10,000M and 30,000M

        // Initialize policy rates (these change less frequently)
        $srr = rand(400, 800) / 10000; // 4% to 8%
        $slfr = rand(700, 1200) / 10000; // 7% to 12%
        $sdfr = rand(500, 1000) / 10000; // 5% to 10%
        $opr = ($slfr + $sdfr) / 2; // Middle of the corridor

        // Create a record for each date in the range
        for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
            // Skip weekends (optional - remove if you want weekend data)
            if ($date->isWeekend()) {
                continue;
            }

            // Small daily fluctuations for market liquidity (tends to move gradually)
            // Now in millions directly (no need to multiply by 1,000,000)
            $marketLiquidity += rand(-2000, 2000);

            // Occasional policy rate changes (less frequent)
            if (rand(1, 30) === 1) { // Roughly monthly changes
                $srr = max(0.02, min(0.1, $srr + (rand(-10, 10) / 1000))); // 2% to 10%
                $sdfr = max(0.03, min(0.15, $sdfr + (rand(-10, 10) / 1000))); // 3% to 15%
                $slfr = max($sdfr + 0.01, min(0.18, $slfr + (rand(-10, 10) / 1000))); // Always higher than SDFR
                $opr = ($slfr + $sdfr) / 2; // Middle of the corridor
            }

            // Market rates fluctuate more frequently, usually within the policy rate corridor
            $callRate = max($sdfr - 0.005, min($slfr + 0.005, $opr + (rand(-20, 20) / 1000)));
            $repoRate = max($sdfr - 0.003, min($slfr, $opr + (rand(-15, 15) / 1000)));

            // Create the daily record - all monetary values now in millions
            LiquidityLkrDaily::create([
                'record_date' => $date->format('Y-m-d'),

                // Market Liquidity (in millions)
                'market_liquidity' => round($marketLiquidity, 2),
                'boc_liquidity' => round($bocLiquidity + rand(-1000, 1000), 2),

                // Policy Rates (unchanged - these are percentages)
                'srr' => round($srr, 4),
                'slfr' => round($slfr, 4),
                'sdfr' => round($sdfr, 4),
                'opr' => round($opr, 4),

                // Market Rates (unchanged - these are percentages)
                'call_rate' => round($callRate, 4),
                'repo_rate' => round($repoRate, 4),

                // DST Accounts (in millions)
                'dst_current_acc' => round(rand(5000, 15000), 2),
                'dst_fund_mgt_acc' => round(rand(1000, 8000), 2),
                'dst_seven_day' => round(rand(500, 3000), 2),
                'dst_fd' => round(rand(2000, 10000), 2),

                // Inflows (in millions)
                'inflow_interbanks' => round(rand(1000, 5000) / 10, 2),
                'inflow_electronic_payments' => round(rand(800, 3000), 2),
                'inflow_dst_ins' => round(rand(500, 2000), 2),
                'inflow_tbills' => round(rand(1000, 6000), 2),
                'inflow_tbonds' => round(rand(500, 2500), 2),
                'inflow_coupons' => round(rand(200, 1000), 2),

                // Outflows (in millions)
                'outflow_interbanks' => round(rand(1000, 5000), 2),
                'outflow_electronic_payments' => round(rand(800, 3000), 2),
                'outflow_dst_outs' => round(rand(500, 2000), 2),
                'outflow_tbills' => round(rand(1000, 6000), 2),
                'outflow_tbonds' => round(rand(500, 2500), 2),

                // DVP and RVP (in millions)
                'dvp' => round(rand(500, 3000), 2),
                'rvp' => round(rand(500, 3000), 2),

                // Customer repo (balance in millions, rate as percentage)
                'customer_repo_balance' => round(rand(1000, 8000), 2),
                'customer_repo_rate' => round(max($sdfr - 0.01, min($slfr - 0.01, $repoRate - (rand(5, 15) / 1000))), 4),
            ]);
        }

        $this->command->info('Liquidity LKR daily records created for ' . $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d') . ' (values in millions)');
    }
}
