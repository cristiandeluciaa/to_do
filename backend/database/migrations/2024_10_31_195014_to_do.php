<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("to_do", function(Blueprint $table){
            $table->id();
            $table->string('titolo')->nullable(); 
            $table->text('descrizione')->nullable();
            $table->integer('priorita')->nullable();
            $table->date('scadenze')->nullable();
            $table->boolean('completata')->nullable();
            $table->integer('posizione')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("to_do");
    }
};
