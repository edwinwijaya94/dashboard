<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'categories';
    public $timestamps = false;
}
