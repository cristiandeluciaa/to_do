<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToDo extends Model
{
    protected $table = "to_do"; 

    protected $fillable = [
        "titolo",
        "descrizione",
        "posizione",
        "priorita",
        "scadenze",
        "completata",
    ];
}
