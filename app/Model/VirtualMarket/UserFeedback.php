<?php

namespace App\Model\VirtualMarket;

use Illuminate\Database\Eloquent\Model;

class UserFeedback extends Model
{

    protected $connection = 'virtual_market';
    protected $table = 'user_feedbacks';
    // public $timestamps = false;
}
