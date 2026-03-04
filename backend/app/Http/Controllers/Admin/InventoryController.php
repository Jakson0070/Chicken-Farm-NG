<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Services\HistoryService;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function stockIn(Request $request, InventoryService $inventory, HistoryService $history): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'batch_code' => ['nullable', 'string', 'max:255'],
            'harvested_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $batch = $this->resolveBatch($product, $validated);

        $before = $product->only(['stock_on_hand', 'stock_reserved']);

        $inventory->stockIn(
            $product,
            (float) $validated['quantity'],
            $batch,
            auth()->id(),
            $validated['reason'] ?? 'stock_in',
            $validated['notes'] ?? null
        );

        $product->refresh();
        $history->product($product, auth()->id(), 'stock_in', [
            'quantity' => (float) $validated['quantity'],
            'before' => $before,
            'after' => $product->only(['stock_on_hand', 'stock_reserved']),
        ], $product->only(['id', 'stock_on_hand', 'stock_reserved']));

        return response()->json([
            'message' => 'Stock added successfully',
            'product' => $product->fresh(),
        ]);
    }

    public function stockOut(Request $request, InventoryService $inventory, HistoryService $history): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'batch_code' => ['nullable', 'string', 'max:255'],
            'reason' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $batch = $this->resolveBatch($product, $validated, false);

        $before = $product->only(['stock_on_hand', 'stock_reserved']);

        $inventory->stockOut(
            $product,
            (float) $validated['quantity'],
            $batch,
            auth()->id(),
            $validated['reason'] ?? 'stock_out',
            $validated['notes'] ?? null
        );

        $product->refresh();
        $history->product($product, auth()->id(), 'stock_out', [
            'quantity' => (float) $validated['quantity'],
            'before' => $before,
            'after' => $product->only(['stock_on_hand', 'stock_reserved']),
        ], $product->only(['id', 'stock_on_hand', 'stock_reserved']));

        return response()->json([
            'message' => 'Stock removed successfully',
            'product' => $product->fresh(),
        ]);
    }

    public function adjust(Request $request, InventoryService $inventory, HistoryService $history): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'new_stock_on_hand' => ['required', 'numeric', 'min:0'],
            'batch_code' => ['nullable', 'string', 'max:255'],
            'reason' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $batch = $this->resolveBatch($product, $validated, false);

        $before = $product->only(['stock_on_hand', 'stock_reserved']);

        $inventory->adjust(
            $product,
            (float) $validated['new_stock_on_hand'],
            $batch,
            auth()->id(),
            $validated['reason'] ?? 'adjustment',
            $validated['notes'] ?? null
        );

        $product->refresh();
        $history->product($product, auth()->id(), 'stock_adjusted', [
            'new_stock_on_hand' => (float) $validated['new_stock_on_hand'],
            'before' => $before,
            'after' => $product->only(['stock_on_hand', 'stock_reserved']),
        ], $product->only(['id', 'stock_on_hand', 'stock_reserved']));

        return response()->json([
            'message' => 'Stock adjusted successfully',
            'product' => $product->fresh(),
        ]);
    }

    private function resolveBatch(Product $product, array $payload, bool $createIfMissing = true): ?InventoryBatch
    {
        if (empty($payload['batch_code'])) {
            return null;
        }

        $batch = InventoryBatch::where('product_id', $product->id)
            ->where('batch_code', $payload['batch_code'])
            ->first();

        if (!$batch && $createIfMissing) {
            $batch = InventoryBatch::create([
                'product_id' => $product->id,
                'batch_code' => $payload['batch_code'],
                'harvested_at' => $payload['harvested_at'] ?? null,
                'expires_at' => $payload['expires_at'] ?? null,
                'quantity_on_hand' => 0,
            ]);
        }

        return $batch;
    }
}
