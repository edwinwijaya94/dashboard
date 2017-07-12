<?php

namespace App\Model\Marketplace;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{

    protected $connection = 'marketplace';
    protected $table = 'feedbacks';
    public $timestamps = false;
}
