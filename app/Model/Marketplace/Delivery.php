<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'deliveries';
    public $timestamps = false;
}
