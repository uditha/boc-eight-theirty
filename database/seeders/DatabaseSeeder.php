<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            // use hash
            'password' => Hash::make('password'),

        ]);

        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->call([
            LiquidityLkrDailySeeder::class,
            LiqudityFcyDailySeeder::class,
            FixedIncomeCashflowSeeder::class,
            FixedIncomeDailySeeder::class,
            UsdLkrDailySeeder::class,
        ]);
    }
}
