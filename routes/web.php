<?php

use App\Http\Controllers\MarketplaceController as Market;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    try {
        DB::connection()->getPdo();

        return response()->json(['application' => 'silicon-trading', 'database' => 'connected']);
    } catch (Throwable $error) {
        return response()->json(['application' => 'silicon-trading', 'database' => 'unavailable'], 503);
    }
});
Route::get('/', [Market::class, 'index'])->name('home');
Route::get('/marketplace', [Market::class, 'catalog'])->name('catalog');
Route::view('/how-it-works', 'market.about')->name('about');
Route::get('/parts/{listing}', [Market::class, 'show'])->name('parts.show');
Route::middleware('guest')->group(function () {
    Route::view('/login', 'market.auth', ['register' => false])->name('login');
    Route::view('/register', 'market.auth', ['register' => true])->name('register');
    Route::post('/login', [Market::class, 'login'])->middleware('throttle:10,1');
    Route::post('/register', [Market::class, 'register'])->middleware('throttle:5,1');
});
Route::middleware('auth')->group(function () {
    Route::post('/logout', [Market::class, 'logout'])->name('logout');
    Route::get('/workspace', [Market::class, 'workspace'])->name('workspace');
    Route::get('/sell', [Market::class, 'create'])->name('sell');
    Route::post('/sell', [Market::class, 'store'])->name('parts.store');
    Route::get('/parts/{listing}/edit', [Market::class, 'edit'])->name('parts.edit');
    Route::put('/parts/{listing}', [Market::class, 'updateListing'])->name('parts.update');
    Route::patch('/parts/{listing}/visibility', [Market::class, 'visibility'])->name('parts.visibility');
    Route::post('/parts/{listing}/reserve', [Market::class, 'reserve'])->name('reserve');
    Route::get('/orders/{order}', [Market::class, 'order'])->name('orders.show');
    Route::post('/orders/{order}/update', [Market::class, 'updateOrder'])->name('orders.update');
    Route::post('/sellers/{user}/verify', [Market::class, 'verify'])->name('sellers.verify');
});
