<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
// redirect dashboard app
Route::get('app/{name}', function($name) {
  return redirect('/dashboard/app/' . $name);
})->where('name', '[A-Za-z0-9\/\.\-]+');
Route::get('assets/{name}', function($name) {
  return redirect('/dashboard/assets/' . $name);
})->where('name', '[A-Za-z0-9\/\.\-]+');

// main routes
Route::get('/', function () {
    return view('dashboard.index');
});
