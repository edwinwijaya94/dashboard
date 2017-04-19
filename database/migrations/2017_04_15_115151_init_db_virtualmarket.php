<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class InitDbVirtualmarket extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // product
        Schema::connection('virtual_market')->create('product', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50);
            $table->integer('quantity');
            $table->integer('unit_id');
            $table->integer('price_min');
            $table->integer('price_max');
            $table->text('file_img');
            $table->boolean('is_available')->default(true);
            $table->integer('category_id');
            $table->timestamps();
        });

        // unit
        Schema::connection('virtual_market')->create('unit', function (Blueprint $table) {
            $table->increments('id');
            $table->string('unit', 30)->unique();
            $table->string('unit_type', 30);
        });

        // order
        Schema::connection('virtual_market')->create('order', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('total_product');
            $table->integer('total_price')->default(0);
            $table->string('order_type');
            $table->dateTime('order_at');
            $table->integer('orderstatus_id');
            $table->integer('buyer_id');
            $table->integer('garendong_id');
        });

        // shopping list / order line
        Schema::connection('virtual_market')->create('shopping_list', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('quantity');
            $table->string('unit', 30);
            $table->integer('subtotal_price')->default(0);
            $table->boolean('is_priority');
            $table->integer('product_id');
            $table->integer('order_id');
        });

        // order status
        Schema::connection('virtual_market')->create('order_status', function (Blueprint $table) {
            $table->increments('id');
            $table->text('status');
        });

        // feedback reason
        Schema::connection('virtual_market')->create('reason', function (Blueprint $table) {
            $table->increments('id');
            $table->text('reason');
        });

        // user feedback
        Schema::connection('virtual_market')->create('user_feedback', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('order_id');
            $table->integer('rating');            
        });

        // unit converter
        Schema::connection('virtual_market')->create('converter', function (Blueprint $table) {
            $table->increments('id');
            $table->string('unit_id', 30);
            $table->integer('in_gram');
        });

        // product category
        Schema::connection('virtual_market')->create('category', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->text('file_img');
            $table->timestamps();
        });

        // feeback reason list
        Schema::connection('virtual_market')->create('reason_list', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_feedback_id');
            $table->integer('reason_id');
        });

        Schema::connection('virtual_market')->create('garendongs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->integer('number_of_allocation')->default(0);
            $table->integer('status')->default(1);
            $table->integer('rating');
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
        Schema::connection('virtual_market')->dropIfExists('product');
        Schema::connection('virtual_market')->dropIfExists('unit');
        Schema::connection('virtual_market')->dropIfExists('order');
        Schema::connection('virtual_market')->dropIfExists('shopping_list');
        Schema::connection('virtual_market')->dropIfExists('order_status');
        Schema::connection('virtual_market')->dropIfExists('reason');
        Schema::connection('virtual_market')->dropIfExists('user_feedback');
        Schema::connection('virtual_market')->dropIfExists('converter');
        Schema::connection('virtual_market')->dropIfExists('category');
        Schema::connection('virtual_market')->dropIfExists('reason_list');
        Schema::connection('virtual_market')->dropIfExists('garendongs');
    }
}
