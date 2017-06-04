<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class SellerStore extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'seller_stores';
    protected $timestamps = false;
}
