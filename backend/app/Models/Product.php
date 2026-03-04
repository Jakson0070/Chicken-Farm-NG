<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'name',
        'description',
        'type',
        'status',
        'unit',
        'pack_size',
        'is_preorder',
        'is_seasonal',
        'requires_cold_chain',
        'price',
        'stock_on_hand',
        'stock_reserved',
    ];

    protected $casts = [
        'is_preorder' => 'boolean',
        'is_seasonal' => 'boolean',
        'requires_cold_chain' => 'boolean',
        'price' => 'decimal:2',
        'pack_size' => 'decimal:2',
        'stock_on_hand' => 'decimal:2',
        'stock_reserved' => 'decimal:2',
    ];

    public function batches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ProductHistory::class);
    }

    public function availableStock(): float
    {
        return (float) $this->stock_on_hand - (float) $this->stock_reserved;
    }
}
