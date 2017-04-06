<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class InitDbMarketplace extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // category
        Schema::connection('marketplace')->create('category', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->timestamps();
        });
        // courier
        Schema::connection('marketplace')->create('courier', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->string('phone_number', 100);
            $table->timestamps();
        });
        // delivery
        Schema::connection('marketplace')->create('delivery', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('transaction_id');
            $table->string('courier_type', 100);
            $table->integer('courier_id');
            $table->string('sender_address', 200);
            $table->string('destination_address', 200);
            $table->string('status', 100);
            $table->timestamps();
        });
        // product
        Schema::connection('marketplace')->create('product', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('seller_id');
            $table->string('name', 100);
            $table->integer('category_id');
            $table->string('photo_url', 200);
            $table->string('status', 100);
            $table->timestamps();
        });
        // seller
        Schema::connection('marketplace')->create('seller', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->string('phone_number', 100);
            $table->string('address', 200);
            $table->string('type', 100);
            $table->integer('sentra_id');
            $table->timestamps();
        });
        // sentra
        Schema::connection('marketplace')->create('sentra', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->string('phone_number', 100);
            $table->string('address', 200);
            $table->timestamps();
        });
        // transaction
        Schema::connection('marketplace')->create('transaction', function (Blueprint $table) {
            $table->increments('id');
            $table->dateTime('datetime');
            $table->string('seller_type', 100);
            $table->integer('seller_id');
            $table->integer('buyer_id');
            $table->integer('product_id');
            $table->integer('quantity');
            $table->integer('amount');
            $table->string('payment_method', 100);
            $table->integer('delivery_id');
            $table->string('status', 100);
            $table->timestamps();
        });   
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('marketplace')->dropIfExists('category');
        Schema::connection('marketplace')->dropIfExists('courier');
        Schema::connection('marketplace')->dropIfExists('delivery');
        Schema::connection('marketplace')->dropIfExists('product');
        Schema::connection('marketplace')->dropIfExists('seller');
        Schema::connection('marketplace')->dropIfExists('sentra');
        Schema::connection('marketplace')->dropIfExists('transaction');
    }
}
