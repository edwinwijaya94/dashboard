<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// virtual market
Route::get('/virtualmarket/transaction', 'VirtualMarketController@getTransaction');
Route::get('/virtualmarket/product', 'VirtualMarketController@getProduct');
Route::get('/virtualmarket/shopper', 'VirtualMarketController@getShopper');
Route::get('/virtualmarket/feedback', 'VirtualMarketController@getFeedback');
Route::get('/virtualmarket/buyer', 'VirtualMarketController@getBuyer');

// marketplace
Route::get('/marketplace/transaction', 'MarketplaceController@getTransaction');
Route::get('/marketplace/product', 'MarketplaceController@getProduct');
Route::get('/marketplace/sentra', 'MarketplaceController@getSentra');
Route::get('/marketplace/feedback', 'MarketplaceController@getFeedback');
Route::get('/marketplace/buyer', 'MarketplaceController@getBuyer');
