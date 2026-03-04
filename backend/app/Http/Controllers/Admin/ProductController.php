<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\HistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->paginate($request->get('per_page', 15));

        return response()->json($products);
    }

    public function store(Request $request, HistoryService $history): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', Rule::in(['livestock', 'produce', 'feed', 'equipment', 'seedlings', 'fertilizer'])],
            'unit' => ['required', 'string', Rule::in(['kg', 'g', 'dozen', 'bag', 'crate', 'piece'])],
            'pack_size' => ['nullable', 'numeric', 'min:0.01'],
            'is_preorder' => ['nullable', 'boolean'],
            'is_seasonal' => ['nullable', 'boolean'],
            'requires_cold_chain' => ['nullable', 'boolean'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'unit' => $validated['unit'],
            'pack_size' => $validated['pack_size'] ?? 1,
            'is_preorder' => $validated['is_preorder'] ?? false,
            'is_seasonal' => $validated['is_seasonal'] ?? false,
            'requires_cold_chain' => $validated['requires_cold_chain'] ?? false,
            'price' => $validated['price'],
            'status' => Product::STATUS_DRAFT,
        ]);

        $history->product($product, auth()->id(), 'created', $product->toArray(), $this->snapshot($product));

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product, HistoryService $history): JsonResponse
    {
        if ($product->status === Product::STATUS_ARCHIVED) {
            return response()->json([
                'message' => 'Archived products cannot be updated.',
            ], 422);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', 'string', Rule::in(['livestock', 'produce', 'feed', 'equipment', 'seedlings', 'fertilizer'])],
            'unit' => ['sometimes', 'string', Rule::in(['kg', 'g', 'dozen', 'bag', 'crate', 'piece'])],
            'pack_size' => ['nullable', 'numeric', 'min:0.01'],
            'is_preorder' => ['nullable', 'boolean'],
            'is_seasonal' => ['nullable', 'boolean'],
            'requires_cold_chain' => ['nullable', 'boolean'],
            'price' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $before = $product->getOriginal();
        $product->update($validated);
        $changes = array_intersect_key($product->getChanges(), $validated);

        if (!empty($changes)) {
            $history->product($product, auth()->id(), 'updated', [
                'before' => array_intersect_key($before, $changes),
                'after' => $changes,
            ], $this->snapshot($product));
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    public function publish(Product $product, HistoryService $history): JsonResponse
    {
        $previous = $product->status;
        $product->status = Product::STATUS_PUBLISHED;
        $product->save();

        $history->product($product, auth()->id(), 'published', [
            'from_status' => $previous,
            'to_status' => $product->status,
        ], $this->snapshot($product));

        return response()->json([
            'message' => 'Product published successfully',
            'product' => $product,
        ]);
    }

    public function archive(Product $product, HistoryService $history): JsonResponse
    {
        $previous = $product->status;
        $product->status = Product::STATUS_ARCHIVED;
        $product->save();

        $history->product($product, auth()->id(), 'archived', [
            'from_status' => $previous,
            'to_status' => $product->status,
        ], $this->snapshot($product));

        return response()->json([
            'message' => 'Product archived successfully',
            'product' => $product,
        ]);
    }

    public function unarchive(Product $product, HistoryService $history): JsonResponse
    {
        $previous = $product->status;
        $product->status = Product::STATUS_DRAFT;
        $product->save();

        $history->product($product, auth()->id(), 'unarchived', [
            'from_status' => $previous,
            'to_status' => $product->status,
        ], $this->snapshot($product));

        return response()->json([
            'message' => 'Product unarchived successfully',
            'product' => $product,
        ]);
    }

    public function history(Product $product): JsonResponse
    {
        $history = $product->histories()
            ->with('user')
            ->latest()
            ->paginate(25);

        return response()->json($history);
    }

    private function snapshot(Product $product): array
    {
        return $product->only([
            'id',
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
            'created_at',
            'updated_at',
        ]);
    }
}
