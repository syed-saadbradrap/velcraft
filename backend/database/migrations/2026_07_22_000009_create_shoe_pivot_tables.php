<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_shoe', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shoe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['shoe_id', 'material_id']);
        });

        Schema::create('buckle_shoe', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shoe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('buckle_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['shoe_id', 'buckle_id']);
        });

        Schema::create('color_shoe', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shoe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('color_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['shoe_id', 'color_id']);
        });

        Schema::create('shoe_size', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shoe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('size_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['shoe_id', 'size_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shoe_size');
        Schema::dropIfExists('color_shoe');
        Schema::dropIfExists('buckle_shoe');
        Schema::dropIfExists('material_shoe');
    }
};
