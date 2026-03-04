<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_CART = 'cart';
    public const STATUS_PENDING_PAYMENT = 'pending_payment';
    public const STATUS_PAID = 'paid';
    public const STATUS_FULFILLMENT = 'fulfillment';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'status',
        'subtotal',
        'discount_total',
        'tax_total',
        'shipping_total',
        'total',
        'delivery_method',
        'delivery_address',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'shipping_total' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function recalcTotals(): void
    {
        $items = $this->items()->get();
        $subtotal = (float) $items->sum(function (OrderItem $item) {
            return (float) $item->quantity * (float) $item->unit_price;
        });

        $discountRate = (float) config('commerce.discount_rate', 0);
        $discountFlat = (float) config('commerce.discount_flat', 0);
        $taxRate = (float) config('commerce.tax_rate', 0);
        $shippingFlat = (float) config('commerce.shipping_flat', 0);

        $discountTotal = $subtotal > 0
            ? min($subtotal, round(($subtotal * $discountRate) + $discountFlat, 2))
            : 0.0;

        $taxableBase = max(0.0, $subtotal - $discountTotal);
        $taxTotal = $taxableBase > 0 ? round($taxableBase * $taxRate, 2) : 0.0;
        $shippingTotal = $subtotal > 0 ? round($shippingFlat, 2) : 0.0;

        $remainingDiscount = $discountTotal;
        $remainingTax = $taxTotal;
        $remainingShipping = $shippingTotal;

        $itemsCount = $items->count();
        $index = 0;

        foreach ($items as $item) {
            $index++;
            $itemSubtotal = round((float) $item->quantity * (float) $item->unit_price, 2);
            $share = $subtotal > 0 ? $itemSubtotal / $subtotal : 0.0;

            if ($index === $itemsCount) {
                $itemDiscount = $remainingDiscount;
                $itemTax = $remainingTax;
                $itemShipping = $remainingShipping;
            } else {
                $itemDiscount = round($discountTotal * $share, 2);
                $itemTax = round($taxTotal * $share, 2);
                $itemShipping = round($shippingTotal * $share, 2);
            }

            $remainingDiscount = round($remainingDiscount - $itemDiscount, 2);
            $remainingTax = round($remainingTax - $itemTax, 2);
            $remainingShipping = round($remainingShipping - $itemShipping, 2);

            $itemTotal = round($itemSubtotal - $itemDiscount + $itemTax + $itemShipping, 2);

            $item->subtotal = $itemSubtotal;
            $item->discount_amount = $itemDiscount;
            $item->tax_amount = $itemTax;
            $item->shipping_amount = $itemShipping;
            $item->total_price = $itemTotal;
            $item->save();
        }

        $this->subtotal = round($subtotal, 2);
        $this->discount_total = round($discountTotal, 2);
        $this->tax_total = round($taxTotal, 2);
        $this->shipping_total = round($shippingTotal, 2);
        $this->total = round($subtotal - $discountTotal + $taxTotal + $shippingTotal, 2);
        $this->save();
    }
}
