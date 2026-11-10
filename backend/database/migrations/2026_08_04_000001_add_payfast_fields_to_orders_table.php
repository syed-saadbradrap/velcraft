<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('payfast_basket_id')->nullable()->after('stripe_payment_intent_id');
            $table->string('payfast_signature')->nullable()->after('payfast_basket_id');
            $table->string('payfast_transaction_id')->nullable()->after('payfast_signature');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['payfast_basket_id', 'payfast_signature', 'payfast_transaction_id']);
        });
    }
};
