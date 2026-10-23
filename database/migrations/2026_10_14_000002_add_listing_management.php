<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('stock_version')->default(0);
        });
        Schema::table('orders', fn (Blueprint $table) => $table->json('listing_snapshot')->nullable());
        DB::table('orders')->orderBy('id')->chunkById(100, function ($orders) {
            foreach ($orders as $order) {
                $listing = DB::table('listings')->where('id', $order->listing_id)->first();
                if ($listing) {
                    DB::table('orders')->where('id', $order->id)->update(['listing_snapshot' => json_encode([
                        'title' => $listing->title, 'model' => $listing->model, 'condition' => $listing->condition,
                        'description' => $listing->description, 'diagnostics' => $listing->diagnostics,
                    ], JSON_THROW_ON_ERROR)]);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn('listing_snapshot'));
        Schema::table('listings', fn (Blueprint $table) => $table->dropColumn(['is_active', 'stock_version']));
    }
};
