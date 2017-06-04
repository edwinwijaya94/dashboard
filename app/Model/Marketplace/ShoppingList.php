<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class ShoppingList extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'shopping_lists';
    protected $timestamps = false;
}
