<?php

use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [RegisterController::class, 'register']);
Route::post('/auth/login', [LoginController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [LoginController::class, 'logout']);
    Route::get('/auth/me', [LoginController::class, 'me']);

    // Cart & checkout
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [CartController::class, 'removeItem']);
    Route::post('/checkout', [CheckoutController::class, 'checkout']);

    // Orders (user)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
        Route::post('/users/{user}/promote', [UserController::class, 'promoteToAdmin']);
        Route::post('/users/{user}/demote', [UserController::class, 'demoteToUser']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        // Products
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{product}', [AdminProductController::class, 'show']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::post('/products/{product}/publish', [AdminProductController::class, 'publish']);
        Route::post('/products/{product}/archive', [AdminProductController::class, 'archive']);
        Route::post('/products/{product}/unarchive', [AdminProductController::class, 'unarchive']);
        Route::get('/products/{product}/history', [AdminProductController::class, 'history']);

        // Inventory
        Route::post('/inventory/stock-in', [InventoryController::class, 'stockIn']);
        Route::post('/inventory/stock-out', [InventoryController::class, 'stockOut']);
        Route::post('/inventory/adjust', [InventoryController::class, 'adjust']);

        // Orders (admin)
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::get('/orders/{order}/history', [AdminOrderController::class, 'history']);

        // Payments (admin)
        Route::post('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
        Route::post('/payments/{payment}/fail', [PaymentController::class, 'fail']);
        Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund']);
        Route::get('/payments/{payment}/history', [PaymentController::class, 'history']);
    });
});
