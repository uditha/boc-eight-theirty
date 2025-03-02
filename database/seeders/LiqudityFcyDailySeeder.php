<?php

namespace Database\Seeders;

use App\Models\LiqudityFcyDaily;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LiqudityFcyDailySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Clear existing records (optional)
        LiqudityFcyDaily::truncate();

        // Starting date
        $date = Carbon::createFromDate(2023, 01, 01);

        // Ending date
        $endDate = Carbon::createFromDate(2025, 2, 28);

        // Base values
        $baseValues = [
            'usd_bal' => 250,
            'usd_rate' => 5.35,
            'eur_bal' => 82,
            'eur_rate' => 4.25,
            'gbp_bal' => 60,
            'gbp_rate' => 5.10,
            'aud_bal' => 50,
            'aud_rate' => 4.35,
            'nostro_bal' => 1850,
            'swaps' => 7.5,
            'swap_cost' => 1.25,
            'placement_on' => 100,
            'placement_on_rate' => 5.25,
            'placement_term' => 150,
            'placement_term_rate' => 5.75,
            'fcbu_payments' => 4,
            'cpc_payments' => 3,
            'import' => 8,
            'pettha' => 3,
            'fcbu' => 2,
            'travel' => 1,
            'branch_import' => 4,
            'usd_unknown_inflows' => 1.2,
            'sofr' => 5.35,
            'brent' => 81.50,
            'nemex' => 3650.25,
            'gold' => 2340.75,
            'fed_fund_rate' => 5.45,
            'uk_bank_rate' => 5.10,
            'ecb_rate' => 4.25,
            'aus_cash_rate' => 4.35,
            'india_repo_rate' => 6.50,
        ];

        // Daily small variations (percentage ranges)
        $variations = [
            'usd_bal' => ['min' => -1.0, 'max' => 1.0],
            'usd_rate' => ['min' => -0.05, 'max' => 0.05],
            'eur_bal' => ['min' => -1.2, 'max' => 1.2],
            'eur_rate' => ['min' => -0.05, 'max' => 0.05],
            'gbp_bal' => ['min' => -1.5, 'max' => 1.5],
            'gbp_rate' => ['min' => -0.05, 'max' => 0.05],
            'aud_bal' => ['min' => -1.3, 'max' => 1.3],
            'aud_rate' => ['min' => -0.05, 'max' => 0.05],
            'nostro_bal' => ['min' => -1.0, 'max' => 1.0],
            'swaps' => ['min' => -2.0, 'max' => 2.0],
            'swap_cost' => ['min' => -1.5, 'max' => 1.5],
            'placement_on' => ['min' => -2.0, 'max' => 2.0],
            'placement_on_rate' => ['min' => -0.05, 'max' => 0.05],
            'placement_term' => ['min' => -1.5, 'max' => 1.5],
            'placement_term_rate' => ['min' => -0.05, 'max' => 0.05],
            'fcbu_payments' => ['min' => -3.0, 'max' => 3.0],
            'cpc_payments' => ['min' => -2.5, 'max' => 2.5],
            'import' => ['min' => -2.0, 'max' => 2.0],
            'pettha' => ['min' => -2.5, 'max' => 2.5],
            'fcbu' => ['min' => -2.0, 'max' => 2.0],
            'travel' => ['min' => -3.0, 'max' => 3.0],
            'branch_import' => ['min' => -2.0, 'max' => 2.0],
            'usd_unknown_inflows' => ['min' => -5.0, 'max' => 5.0],
            'sofr' => ['min' => -0.05, 'max' => 0.05],
            'brent' => ['min' => -1.0, 'max' => 1.0],
            'nemex' => ['min' => -0.5, 'max' => 0.5],
            'gold' => ['min' => -0.8, 'max' => 0.8],
            'fed_fund_rate' => ['min' => -0.02, 'max' => 0.02],
            'uk_bank_rate' => ['min' => -0.02, 'max' => 0.02],
            'ecb_rate' => ['min' => -0.02, 'max' => 0.02],
            'aus_cash_rate' => ['min' => -0.02, 'max' => 0.02],
            'india_repo_rate' => ['min' => -0.03, 'max' => 0.03],
        ];

        $records = [];
        $currentValues = $baseValues;

        // Generate data for each day
        while ($date->lte($endDate)) {
            $data = [
                'record_date' => $date->format('Y-m-d'),
            ];

            // Apply small random variations to each field
            foreach ($currentValues as $field => $value) {
                if (isset($variations[$field])) {
                    $percentChange = mt_rand($variations[$field]['min'] * 100, $variations[$field]['max'] * 100) / 100;
                    $change = $value * ($percentChange / 100);
                    $currentValues[$field] = $value + $change;
                }

                $data[$field] = $currentValues[$field];

                // Round appropriate values
                if (in_array($field, ['usd_rate', 'eur_rate', 'gbp_rate', 'aud_rate'])) {
                    $data[$field] = round($data[$field], 2);
                } elseif (strpos($field, '_bal') !== false || in_array($field, ['swaps', 'swap_cost', 'placement_on', 'placement_term', 'fcbu_payments', 'cpc_payments', 'import', 'pettha', 'fcbu', 'travel', 'branch_import', 'usd_unknown_inflows'])) {
                    $data[$field] = round($data[$field]);
                } elseif (in_array($field, ['sofr', 'brent', 'nemex', 'gold', 'fed_fund_rate', 'uk_bank_rate', 'ecb_rate', 'aus_cash_rate', 'india_repo_rate', 'placement_on_rate', 'placement_term_rate'])) {
                    $data[$field] = round($data[$field], 2);
                }
            }

            // Insert the record
            LiqudityFcyDaily::create($data);

            // Move to next day
            $date->addDay();
        }

        $this->command->info('Liquidity FCY daily data seeded successfully!');
    }
}