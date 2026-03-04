<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type');
            $table->string('status')->default('draft');
            $table->string('unit')->default('piece');
            $table->decimal('pack_size', 12, 2)->default(1);
            $table->boolean('is_preorder')->default(false);
            $table->boolean('is_seasonal')->default(false);
            $table->boolean('requires_cold_chain')->default(false);
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('stock_on_hand', 12, 2)->default(0);
            $table->decimal('stock_reserved', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
