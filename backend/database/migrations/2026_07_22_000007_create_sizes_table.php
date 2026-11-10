<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sizes', function (Blueprint $table): void {
            $table->id();
            $table->string('gender');
            $table->string('label');
            $table->unsignedTinyInteger('value');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['gender', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sizes');
    }
};
