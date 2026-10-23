<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('platform_fee_rate')->default(800)->after('total_centavos'); // 8% default take-rate
            $table->unsignedBigInteger('platform_fee_centavos')->default(0)->after('platform_fee_rate');
            $table->unsignedBigInteger('seller_payout_centavos')->default(0)->after('platform_fee_centavos');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['platform_fee_rate', 'platform_fee_centavos', 'seller_payout_centavos']);
        });
    }
};
