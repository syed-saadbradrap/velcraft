<?php



use Illuminate\Database\Migrations\Migration;

use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\Schema;



return new class extends Migration

{

    public function up(): void

    {

        Schema::table('carts', function (Blueprint $table): void {

            $table->dropForeign(['user_id']);

            $table->uuid('guest_token')->nullable()->unique()->after('user_id');

            $table->foreignId('user_id')->nullable()->change();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

        });



        Schema::table('orders', function (Blueprint $table): void {

            $table->dropForeign(['user_id']);

            $table->string('guest_email')->nullable()->after('user_id');

            $table->uuid('guest_checkout_token')->nullable()->unique()->after('guest_email');

            $table->foreignId('user_id')->nullable()->change();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

        });

    }



    public function down(): void

    {

        Schema::table('orders', function (Blueprint $table): void {

            $table->dropForeign(['user_id']);

            $table->dropColumn(['guest_email', 'guest_checkout_token']);

            $table->foreignId('user_id')->nullable(false)->change();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

        });



        Schema::table('carts', function (Blueprint $table): void {

            $table->dropForeign(['user_id']);

            $table->dropColumn('guest_token');

            $table->foreignId('user_id')->nullable(false)->change();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

        });

    }

};


