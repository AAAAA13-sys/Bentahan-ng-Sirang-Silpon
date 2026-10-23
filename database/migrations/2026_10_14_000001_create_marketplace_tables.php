<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('buyer');
            $table->string('location')->default('Metro Manila');
            $table->boolean('seller_verified')->default(false);
        });
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users');
            $table->string('title');
            $table->string('brand');
            $table->string('model');
            $table->string('category');
            $table->string('condition');
            $table->text('description');
            $table->text('diagnostics');
            $table->unsignedInteger('price_centavos');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('minimum_quantity')->default(1);
            $table->string('art')->default('board');
            $table->timestamps();
            $table->index(['category', 'brand']);
        });
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users');
            $table->foreignId('listing_id')->constrained();
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('total_centavos');
            $table->string('status')->default('reserved');
            $table->text('address');
            $table->string('courier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->text('dispute')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('listings');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['role', 'location', 'seller_verified']));
    }
};
