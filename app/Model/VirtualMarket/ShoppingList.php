<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class ShoppingList extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'shopping_lists';
    // public $timestamps = false;
}
