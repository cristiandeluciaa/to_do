<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ToDoController;
use App\Services\Priorita;
use App\Http\Middleware\CheckClientCertificate;


Route::get("/all",[ToDoController::class, "all"]);
Route::post("/task/add",[ToDoController::class,"add"])->name("task.add");
Route::post("/task/edit",[ToDoController::class,"edit"])->name("task.edit");
Route::post("/task/reorder",[ToDoController::class,"reorder"])->name("task.reorder");
Route::delete("/task/del",[ToDoController::class,"del"])->name("task.del");

Route::get('/test-cert', function () {
    return 'Accesso consentito!';
})->middleware(CheckClientCertificate::class);
