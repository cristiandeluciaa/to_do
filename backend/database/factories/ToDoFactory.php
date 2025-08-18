<?php

namespace Database\Factories;

use App\Models\ToDo;
use Illuminate\Database\Eloquent\Factories\Factory;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\to_do>
 */
class ToDoFactory extends Factory
{

    protected $model = ToDo::class;
    
    public function definition(): array
    {
        return [
            "titolo" => $this->faker->sentence(), 
            "descrizione" => $this->faker->text(),
            "priorita" => $this->faker->randomElement(["1", "2", "3"]),
            "scadenze" => $this->faker->date(),
            "completata" => $this->faker->boolean(),
            "posizione" => $this->faker->numberBetween(0, 100),
        ];
    }
}