<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


use App\Http\Controllers\Dashboard\LiqudityController;
use App\Http\Controllers\Dashboard\FixedIncomeController;
use App\Http\Controllers\Dashboard\UsdLkrController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');



    Route::get('/liquidity/lkr', [LiqudityController::class, 'lkr'])
        ->name('liquidity.lkr');

    Route::get('/liquidity/fcy', [LiqudityController::class, 'fcy'])
        ->name('liquidity.fcy');

    Route::get('/fixed-income', [FixedIncomeController::class, 'index'])
        ->name('fixed-income.index');

    // usdlkr
    Route::get('/usd-lkr', [UsdLkrController::class, 'index'])
        ->name('usd-lkr.index');



});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
