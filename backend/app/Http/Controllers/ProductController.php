<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->where('status', Product::STATUS_PUBLISHED);

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $products = $query->paginate($request->get('per_page', 15));

        return response()->json($products);
    }

    public function show(Product $product): JsonResponse
    {
        if ($product->status !== Product::STATUS_PUBLISHED) {
            return response()->json([
                'message' => 'Product not available.',
            ], 404);
        }

        return response()->json($product);
    }
}
