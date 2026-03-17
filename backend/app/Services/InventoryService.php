<?php

namespace App\Services;

use App\Models\InventoryBatch;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function stockIn(Product $product, float $quantity, ?InventoryBatch $batch = null, ?int $userId = null, ?string $reason = null, ?string $notes = null): void
    {
        DB::transaction(function () use ($product, $quantity, $batch, $userId, $reason, $notes) {
            $product->stock_on_hand = (float) $product->stock_on_hand + $quantity;
            $product->save();

            if ($batch) {
                $batch->quantity_on_hand = (float) $batch->quantity_on_hand + $quantity;
                $batch->save();
            }

            $this->recordMovement($product, $quantity, 'in', $batch?->id, $userId, $reason, $notes);
        });
    }

    public function stockOut(Product $product, float $quantity, ?InventoryBatch $batch = null, ?int $userId = null, ?string $reason = null, ?string $notes = null): void
    {
        DB::transaction(function () use ($product, $quantity, $batch, $userId, $reason, $notes) {
            $product->stock_on_hand = max(0, (float) $product->stock_on_hand - $quantity);
            $product->save();

            if ($batch) {
                $batch->quantity_on_hand = max(0, (float) $batch->quantity_on_hand - $quantity);
                $batch->save();
            }

            $this->recordMovement($product, $quantity, 'out', $batch?->id, $userId, $reason, $notes);
        });
    }

    public function reserve(Product $product, float $quantity, ?InventoryBatch $batch = null, ?int $userId = null): void
    {
        DB::transaction(function () use ($product, $quantity, $batch, $userId) {
            // Re-fetch product with lock to ensure stock doesn't change during transaction
            $lockedProduct = Product::query()->lockForUpdate()->findOrFail($product->id);

            if ($lockedProduct->availableStock() < $quantity) {
                throw new \RuntimeException('Insufficient stock for product: ' . $lockedProduct->name);
            }

            $lockedProduct->stock_reserved = (float) $lockedProduct->stock_reserved + $quantity;
            $lockedProduct->save();

            $this->recordMovement($lockedProduct, $quantity, 'reserve', $batch?->id, $userId, 'checkout');
        });
    }

    public function release(Product $product, float $quantity, ?InventoryBatch $batch = null, ?int $userId = null): void
    {
        DB::transaction(function () use ($product, $quantity, $batch, $userId) {
            $product->stock_reserved = max(0, (float) $product->stock_reserved - $quantity);
            $product->save();

            $this->recordMovement($product, $quantity, 'release', $batch?->id, $userId, 'payment_failed');
        });
    }

    public function deductReserved(Product $product, float $quantity, ?InventoryBatch $batch = null, ?int $userId = null): void
    {
        DB::transaction(function () use ($product, $quantity, $batch, $userId) {
            $product->stock_reserved = max(0, (float) $product->stock_reserved - $quantity);
            $product->stock_on_hand = max(0, (float) $product->stock_on_hand - $quantity);
            $product->save();

            if ($batch) {
                $batch->quantity_on_hand = max(0, (float) $batch->quantity_on_hand - $quantity);
                $batch->save();
            }

            $this->recordMovement($product, $quantity, 'deduct', $batch?->id, $userId, 'payment_paid');
        });
    }

    public function adjust(Product $product, float $newOnHand, ?InventoryBatch $batch = null, ?int $userId = null, ?string $reason = null, ?string $notes = null): void
    {
        DB::transaction(function () use ($product, $newOnHand, $batch, $userId, $reason, $notes) {
            $difference = $newOnHand - (float) $product->stock_on_hand;
            $product->stock_on_hand = max(0, $newOnHand);
            $product->save();

            if ($batch) {
                $batch->quantity_on_hand = max(0, (float) $batch->quantity_on_hand + $difference);
                $batch->save();
            }

            $this->recordMovement($product, abs($difference), 'adjust', $batch?->id, $userId, $reason, $notes);
        });
    }

    private function recordMovement(Product $product, float $quantity, string $type, ?int $batchId, ?int $userId, ?string $reason = null, ?string $notes = null): void
    {
        InventoryMovement::create([
            'product_id' => $product->id,
            'inventory_batch_id' => $batchId,
            'user_id' => $userId,
            'type' => $type,
            'quantity' => $quantity,
            'reason' => $reason,
            'notes' => $notes,
        ]);
    }
}
