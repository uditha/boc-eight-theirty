<?php

namespace Database\Seeders;

use App\Models\FixedIncomeCashflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class FixedIncomeCashflowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing records
        FixedIncomeCashflow::truncate();

        // Path to the CSV file
        $csvFile = storage_path('app/data/fixed_income_cashflows.csv');

        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at: $csvFile");
            return;
        }

        // Open the CSV file
        $handle = fopen($csvFile, 'r');

        // Skip the header row
        $headers = fgetcsv($handle);

        // Process each row
        $count = 0;
        while (($row = fgetcsv($handle)) !== false) {
            try {
                // Map CSV columns to database fields
                // Ensure we have enough columns
                if (count($row) >= 7) {
                    $security = trim($row[0]);
                    $maturity = trim($row[1]);
                    $amount = $this->cleanNumber(trim($row[2]));
                    $coupon = trim($row[3]);
                    $cf_date = trim($row[4]);
                    $coupon_amount = trim($row[5]) === '-' ? 0 : $this->cleanNumber(trim($row[5]));
                    $capital = trim($row[6]) === '-' ? 0 : $this->cleanNumber(trim($row[6]));

                    FixedIncomeCashflow::create([
                        'security' => $security,
                        'maturity' => $maturity,
                        'amount' => $amount,
                        'coupon' => $coupon,
                        'cf_date' => $cf_date,
                        'coupon_amount' => $coupon_amount,
                        'capital' => $capital,
                    ]);

                    $count++;
                }
            } catch (\Exception $e) {
                Log::error("Error processing CSV row: " . json_encode($row) . " - " . $e->getMessage());
                $this->command->error("Error processing row: " . $e->getMessage());
            }
        }

        fclose($handle);

        $this->command->info("Successfully imported $count fixed income cashflow records.");
    }

    /**
     * Clean number values from the CSV (removing commas and other formatting)
     *
     * @param string $number
     * @return float
     */
    private function cleanNumber($number)
    {
        // Remove commas, spaces, and other non-numeric characters (except decimal points)
        $cleaned = preg_replace('/[^0-9\.]/', '', $number);

        return (float) $cleaned;
    }
}