<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class DeliveryAgent extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'delivery_agents';
    public $timestamps = false;
}
