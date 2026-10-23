<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Listing extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['price_centavos' => 'integer', 'quantity' => 'integer', 'is_active' => 'boolean', 'stock_version' => 'integer'];
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)->whereColumn('quantity', '>=', 'minimum_quantity');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
