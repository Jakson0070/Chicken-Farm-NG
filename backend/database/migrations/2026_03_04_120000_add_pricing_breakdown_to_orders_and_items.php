<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('discount_total', 12, 2)->default(0)->after('subtotal');
            $table->decimal('tax_total', 12, 2)->default(0)->after('discount_total');
            $table->decimal('shipping_total', 12, 2)->default(0)->after('tax_total');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('subtotal', 12, 2)->default(0)->after('unit_price');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('subtotal');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('discount_amount');
            $table->decimal('shipping_amount', 12, 2)->default(0)->after('tax_amount');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'discount_amount', 'tax_amount', 'shipping_amount']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['discount_total', 'tax_total', 'shipping_total']);
        });
    }
};
