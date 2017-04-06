<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('order', function (Blueprint $table) {
            $table->increments('id');
            $table->string('recipient_name', 30);
            $table->longText('recipient_address');
            $table->integer('order_status');
            $table->dateTime('order_at');
            $table->integer('deliverer_id')->unsigned();
            $table->foreign('deliverer_id')->references('id')->on('deliverer');
            $table->integer('shopper_id')->unsigned();
            $table->foreign('shopper_id')->references('id')->on('shopper');
            $table->integer('buyer_id')->unsigned();
            $table->foreign('buyer_id')->references('id')->on('buyer');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('order');
    }
}
