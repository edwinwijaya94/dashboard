<?php

namespace App\Http\Controllers;

// use Validator;
use Auth;
use DateTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use Phpml\Regression\LeastSquares;

class OperationalController extends Controller
{
    
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    // HELPER FUNCTIONS
    public function setDefault()
    {
        $default = array();
        $default['startDate'] = '1960-01-01';
        $default['endDate'] = '2020-01-01';
        $default['type'] = 'stats';
        $default['aggregate'] = 'sum';
        $default['aggregateBy'] = 'total_price'; // aggregate this column
        $default['decimals'] = 3; // decimal places
        $default['page'] = 1;
        $default['rows'] = 5;
        $default['sort'] = 'highest';
        $default['productId'] = 1;
        return $default;
    }

    public function setQuery($request, $default)
    {
        $query = array();
        $query['startDate'] = $request->query('start_date', $default['startDate']);
        $query['endDate'] = $request->query('end_date', $default['endDate']);
        // modify date to timestamp format
        $query['startDate'] = $query['startDate'].' 00:00:00';
        $query['endDate'] = $query['endDate'].' 23:59:59';
        
        $query['type'] = $request->query('type', $default['type']);

        // aggregate query, ex: coalesce(sum(total_price), 0)
        $query['aggregate'] = 'coalesce('.$request->query('aggregate', $default['aggregate']).'('.$default['aggregateBy'].'), 0 )';

        // Round results if using avg function
        if($query['aggregate'] == 'avg('.$default['aggregateBy'].')') {
            $query['aggregate'] = 'round('.$query['aggregate'].','.$default['decimals'].')';
        }

        $query['page'] = $request->query('page', $default['page']);
        $query['rows'] = $request->query('rows', $default['rows']);
        $query['sort'] = $request->query('sort', $default['sort']);

        $query['productId'] = $request->query('product_id', $default['productId']);

        return $query;
    }

    public function setStatus() 
    {
        // set status
        $status = array();
        $status['error'] = 0;
        $status['message'] = 'OK';

        return $status;
    }

    public function getPrevDatePeriod($startDate, $endDate) {
        $prevDatePeriod = array();
        
        $start = Carbon::createFromFormat('Y-m-d H:i:s', $startDate);
        $end = Carbon::createFromFormat('Y-m-d H:i:s', $endDate);
        $diff = $start->diffInMinutes($end)+1;
        $start = $start->subMinutes($diff)->toDateTimeString();
        $end = $end->subMinutes($diff)->toDateTimeString();
        
        $prevDatePeriod['startDate'] = $start;
        $prevDatePeriod['endDate'] = $end;

        return $prevDatePeriod;
    }

    public function getGranularity($startDate, $endDate) {
        $start = Carbon::createFromFormat('Y-m-d H:i:s', $startDate);
        $end = Carbon::createFromFormat('Y-m-d H:i:s', $endDate);
        $diff = $start->diffInDays($end)+1;

        if($diff > 30) {
            $granularity = 'month';
        } else {
            $granularity = 'day';
        }
        return $granularity;
    }

    public function getConfig(Request $request) {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);
        
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        $data = array();
        $data['prevPeriod'] = $prevPeriod;

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }
    
    // OVERVIEW
    public function getOverview(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        return $this->getOverviewData($query);
    }

    public function getOverviewData($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        DB::enableQueryLog();
        // execute

        // product availability
        $availability = DB::connection('virtual_market')
                    ->table('products')
                    ->select(DB::raw('is_available, count(*)'))
                    ->groupBy('is_available')
                    ->get();

        // unavailable products
        $unavailableProducts = DB::connection('virtual_market')
                    ->table('products')
                    ->select('name')
                    ->where('is_available', '=', false)
                    ->get();
        
        // product list
        $product = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('categories', 'products.category_id', '=', 'categories.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->join('units', 'products.default_unit_id', 'units.id')
                    ->select(DB::raw('products.id, products.name, categories.name as category, count(*), sum(quantity) as sums, units.unit, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price, round((cast(count(case when order_lines.is_available then 1 end) as float)/count(*) *100)::numeric, 2) as availability'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->groupBy('categories.name')
                    ->groupBy('units.unit')
                    ->orderByRaw('count desc, products.name asc')
                    ->get();

        for($i=0; $i<count($product); $i++) {
            $countData = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->join('units', 'products.default_unit_id', 'units.id')
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->where('products.id', '=', $product[$i]->id)
                    ->count();
            if($countData) {
                $prevData = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->join('units', 'products.default_unit_id', 'units.id')
                    ->select(DB::raw('count(*), sum(quantity) as sums, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price, round((cast(count(case when order_lines.is_available then 1 end) as float)/count(*) *100)::numeric, 2) as availability'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->where('products.id', '=', $product[$i]->id)
                    ->get();
            } else {
                $prevData = array();
            }
            if(count($prevData) != 0) {
                $product[$i]->sum_change = (string) ($product[$i]->sums - $prevData[0]->sums);
                $product[$i]->price_change = (string) ($product[$i]->avg_price - $prevData[0]->avg_price);
                $product[$i]->availability_change = (string) ($product[$i]->availability - $prevData[0]->availability);
            } else {
                $product[$i]->sum_change = (string) 0;
                $product[$i]->price_change = (string) 0;
                $product[$i]->availability_change = (string) 0;
            }
        }

        $data = array();
        $data['product']['availability'] = $availability;
        $data['product']['unavailable_list'] = $unavailableProducts;
        $data['product']['list'] = $product;

        // transaction count
        $currentTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('status', ['success'])
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    // ->groupBy('status')
                    ->get();

        $prevTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('status', ['success'])
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    // ->groupBy('status')
                    ->get();

        // transaction status
        $transactionStatus = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('status, count(*)'))
                    // ->whereIn('status', ['success'])
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('status')
                    ->orderByRaw('count desc')
                    ->get();        

        $data['transaction'] = array();
        $data['transaction']['count'] = array();
        $data['transaction']['count']['current'] = $currentTransactionCount[0]->count;
        $data['transaction']['count']['prev'] = $prevTransactionCount[0]->count;
        $data['transaction']['status'] = $transactionStatus;
        
         // product price
        $productPrice = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('products.id, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->get();

        for($i=0; $i<count($productPrice); $i++) {
            $prevPrice = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('products.id, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->where('products.id', '=', $productPrice[$i]->id)
                    ->groupBy('products.id')
                    ->get();

            // change in percent
            if(count($prevPrice) != 0) {
                $productPrice[$i]->price_change = (string) round((float)($productPrice[$i]->avg_price - $prevPrice[0]->avg_price)/($prevPrice[0]->avg_price)*100, 2);
            } else {
                $productPrice[$i]->price_change = (string) 0;
            }
        }
        // average price change in percent
        $total = 0;
        for($i=0; $i<count($productPrice); $i++){
            $total += $productPrice[$i]->price_change;
        }
        if(count($productPrice)>0)
            $fluctuation = round(($total / count($productPrice)), 2);
        else 
            $fluctuation = null;

        $data['fluctuation'] = $fluctuation;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    // TRANSACTION
    public function getTransaction(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'history')
            return $this->getTransactionByHistory($query);
        else if($query['type'] == 'stats')
            return $this->getTransactionStats($query);
    }

    public function getTransactionStats($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        DB::enableQueryLog();
        // execute
        // transaction count
        $currentTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('status', ['success'])
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    // ->groupBy('status')
                    ->get();

        $prevTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('status', ['success'])
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    // ->groupBy('status')
                    ->get();

        // total transaction
        $currentTransactionValue = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(total_price), 0), 0) as average'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->where('status', '=', 'success')
                    ->get();

        $prevTransactionValue = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(total_price), 0), 0) as average'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->where('status', '=', 'success')
                    ->get();

        // transaction status
        $transactionStatus = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('status, count(*)'))
                    // ->whereIn('status', ['success'])
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('status')
                    ->orderByRaw('count desc')
                    ->get();        

        // app platform (mobile / sms)
        $appPlatform = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('order_type as name, count(*)'))
                    ->where('status', '=', 'success')
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('order_type')
                    ->get();


        $data = array();
        $data['transaction'] = array();
        $data['transaction']['count'] = array();
        $data['transaction']['count']['current'] = $currentTransactionCount[0];
        $data['transaction']['count']['prev'] = $prevTransactionCount[0];
        $data['transaction']['value'] = array();
        $data['transaction']['value']['current'] = $currentTransactionValue[0];
        $data['transaction']['value']['prev'] = $prevTransactionValue[0];

        $data['transaction_status'] = $transactionStatus;
        $data['app_platform'] = $appPlatform;
        
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getTransactionByHistory($query)
    {
        $granularity = $this->getGranularity($query['startDate'], $query['endDate']);
        if($granularity == 'month') {
            $dateQuery = 'to_char(orders.created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(orders.created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }

        DB::enableQueryLog();
        // execute
        $transaction = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw($query['aggregate'].'as value, count(*),'.$dateQuery))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->where('status', '=', 'success')
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    // ->toSql();
                    ->get();
        // dd ($data);

        $data = array();
        $data['granularity'] = $granularity;
        $data['transaction'] = $transaction;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    // PRODUCT
    public function getProduct(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'stats')
            return $this->getProductStats($query);
        else if($query['type'] == 'toplist')
            return $this->getProductTopList($query);
        else if($query['type'] == 'list')
            return $this->getProductList($query);
        else if($query['type'] == 'trend')
            return $this->getProductTrend($query);
    }
    
    public function getProductStats($query)
    {
        DB::enableQueryLog();
        // execute
        // product availability
        $availability = DB::connection('virtual_market')
                    ->table('products')
                    ->select(DB::raw('is_available, count(*)'))
                    ->groupBy('is_available')
                    // ->toSql();
                    ->get();
        // dd ($data);

        // unavailable products
        $unavailableProducts = DB::connection('virtual_market')
                    ->table('products')
                    ->select('name')
                    ->where('is_available', '=', false)
                    ->limit(5) //separate this api and create pagination
                    // ->toSql();
                    ->get();
        
        $data = array();
        $data['availability'] = $availability;
        $data['unavailable_products'] = $unavailableProducts;

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getProductTopList($query)
    {
        // $rows = (int)$query['rows'];
        // $page = (int)$query['page'];
        DB::enableQueryLog();
        // execute
        // success / failed transaction
        $dbQuery = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('categories', 'products.category_id', '=', 'categories.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->join('units', 'products.default_unit_id', 'units.id')
                    ->select(DB::raw('products.id, products.name, categories.name as category, count(*), sum(quantity) as sums, units.unit, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price, round((cast(count(case when order_lines.is_available then 1 end) as float)/count(*) *100)::numeric, 2) as availability'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->groupBy('categories.name')
                    ->groupBy('units.unit')
                    ->orderByRaw('count desc, products.name asc')
                    ->limit(5);


        $product = $dbQuery
                    ->get();

        $data = array();
        $data['product'] = $product;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getProductList($query)
    {
        // $rows = (int)$query['rows'];
        // $page = (int)$query['page'];
        DB::enableQueryLog();
        // execute
        // success / failed transaction
        $dbQuery = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('categories', 'products.category_id', '=', 'categories.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->join('units', 'products.default_unit_id', 'units.id')
                    ->select(DB::raw('products.id, products.name, categories.name as category, count(*), sum(quantity) as sums, units.unit, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price, round((cast(count(case when order_lines.is_available then 1 end) as float)/count(*) *100)::numeric, 2) as availability'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->groupBy('categories.name')
                    ->groupBy('units.unit')
                    ->orderByRaw('count desc, products.name asc');

        $totalRows = $dbQuery->get()->count();

        $product = $dbQuery
                    // ->skip($page*$rows - $rows)
                    // ->take($rows)
                    ->get();

        $data = array();
        $data['total_rows'] = $totalRows;
        $data['product'] = $product;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getProductTrend($query)
    {
        $granularity = $this->getGranularity($query['startDate'], $query['endDate']);
        if($granularity == 'month') {
            $dateQuery = 'to_char(orders.created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(orders.created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }

        // $dateQuery = 'to_char(orders.created_at, \'YYYY-MM-DD\') as date';
        // $dateGroupBy = array('date');
        // $dateOrder = 'date asc';

        DB::enableQueryLog();
        // execute
        $dbQuery = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('sum(quantity) as count, round(avg(price/quantity), 0) as price,'.$dateQuery))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->where('order_lines.product_id', '=', $query['productId'])
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder);

        $product = $dbQuery
                    ->get()
                    ->toArray();
          
        $start = Carbon::createFromFormat('Y-m-d H:i:s', $query['startDate'], 'Asia/Jakarta');
        $end = Carbon::createFromFormat('Y-m-d H:i:s', $query['endDate'], 'Asia/Jakarta');
        $now = Carbon::now('Asia/Jakarta');

        if($end->diffInDays($now) < 1 && $start->diffInDays($end) <= 30) {
            
            //fix null values
            $trendData = [];
            $prevTime = NULL;
            for($i=0; $i<count($product); $i++) {
              $item = $product[$i];
              
              $currentTime = Carbon::createFromFormat('Y-m-d', $item->date);
              if ($prevTime != NULL) {
                for ($time=$prevTime->addDay(); $time->lt($currentTime); $time->addDay()) {

                  $x = array();
                  $x['date'] = $time->toDateString();
                  $x['count'] = 0;
                  $x['price'] = $prevItem->price; // same as previous day
                  
                  array_push($trendData, (object)$x);
                }
              }
              array_push($trendData, $item);
              $prevTime = $currentTime;
              $prevItem = $item;
            }
            //check null values on endDate
            $endTime = Carbon::createFromFormat('Y-m-d H:i:s', $query['endDate']);
            $lastTime = Carbon::createFromFormat('Y-m-d', $trendData[count($trendData)-1]->date);
            for ($time=$lastTime->addDay(); $time->lt($endTime); $time->addDay()) {
              $x = array();
              $x['date'] = $time->toDateString();
              $x['count'] = 0;
              $x['price'] = $product[count($product)-1]->price; // same as last day
              array_push($trendData, (object)$x);
            }

            // predict using regression
            $samples = [];
            $countTargets = [];
            $priceTargets = [];
            for($i=0; $i<count($trendData); $i++) {
                array_push($samples, [$i+1]);
                array_push($countTargets, $trendData[$i]->count);
                array_push($priceTargets, $trendData[$i]->price);
            }

            $countRegression = new LeastSquares();
            $countRegression->train($samples, $countTargets);

            $priceRegression = new LeastSquares();
            $priceRegression->train($samples, $priceTargets);

            // predict for number of days
            $predictions = [];
            for($i=1; $i<=3; $i++) {
                $x = [];
                $x['date'] = Carbon::createFromFormat('Y-m-d', $trendData[count($trendData)-1]->date)->addDays($i)->toDateString();
                // predict product count
                $countPredictedValue = $countRegression->predict([count($trendData)+$i]);
                if($countPredictedValue < 0)
                    $countPredictedValue = 0;
                $x['count'] = (string) round($countPredictedValue, 0);
                // predict product price
                $pricePredictedValue = $priceRegression->predict([count($trendData)+$i]);
                if($pricePredictedValue < 0)
                    $pricePredictedValue = 0;
                $x['price'] = (string) round($pricePredictedValue, 0);

                array_push($predictions, (object)$x);
            }
            $trendData = array_merge($trendData, $predictions);
        } else {
            $trendData = $product;
        }

        $data = array();
        $data['granularity'] = $granularity;
        $data['trend'] = $trendData;

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    // SHOPPER
    public function getShopper(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'stats')
            return $this->getShopperStats($query);
        else if($query['type'] == 'toplist')
            return $this->getShopperTopList($query);
        else if($query['type'] == 'list')
            return $this->getShopperList($query);
    }

    public function getShopperStats($query)
    {
        DB::enableQueryLog();
        // execute
        $data = DB::connection('virtual_market')
                    ->table('garendongs')
                    ->select(DB::raw('count(*)'))
                    ->get();

        // $data = array();
        // $data['rating'] = $rating;
        // $data['feedback'] = $feedback;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data[0]
                ]);      
    }

    public function getShopperTopList($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        if($query['sort'] == 'highest')
            $ratingOrder = 'rating desc';
        else if ($query['sort'] == 'lowest')
            $ratingOrder = 'rating asc';
        $ratingOrder .= ', name asc';

        DB::enableQueryLog();
        // execute
        $shopper = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('garendongs', 'garendongs.id', '=', 'orders.garendong_id')
                    ->select(DB::raw('garendongs.id, garendongs.user_id as name, count(orders.rating) as orders, round(avg(orders.rating), 2) as rating'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->whereNotNull('orders.rating')
                    ->groupBy('garendongs.id')
                    ->orderByRaw($ratingOrder)
                    ->limit(5)
                    ->get();

        $data = array();
        $data['shopper'] = $shopper;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);      
    }

    public function getShopperList($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        // $rows = (int)$query['rows'];
        // $page = (int)$query['page'];
        if($query['sort'] == 'highest')
            $ratingOrder = 'rating desc';
        else if ($query['sort'] == 'lowest')
            $ratingOrder = 'rating asc';
        $ratingOrder .= ', name asc';

        DB::enableQueryLog();
        // execute
        $currentShopperData = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('garendongs', 'garendongs.id', '=', 'orders.garendong_id')
                    ->select(DB::raw('garendongs.id, garendongs.user_id as name, count(orders.rating) as orders, round(avg(orders.rating), 2) as rating'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->whereNotNull('orders.rating')
                    // ->groupBy('garendongs.user_id')
                    ->groupBy('garendongs.id')
                    ->orderByRaw($ratingOrder);
        $currentShopperCount = $currentShopperData->get()->count();
        $currentAvgRating = round($currentShopperData->get()->avg('rating'), 2);
        $shoppers = $currentShopperData->get();

        $shopperChanges = array();
        foreach ($shoppers as $shopper) {
            $result = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('garendongs', 'garendongs.id', '=', 'orders.garendong_id')
                    ->select(DB::raw('count(orders.rating) as orders, round(avg(orders.rating), 2) as rating'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->where('garendongs.id', '=', $shopper->id)
                    ->whereNotNull('orders.rating')
                    ->groupBy('garendongs.id')
                    // ->orderByRaw($ratingOrder);
                    ->get();
                array_push($shopperChanges, $result);
        }
        for($i=0; $i<count($shoppers); $i++){
            $prevOrder = count($shopperChanges[$i]) > 0 ? $shopperChanges[$i][0]->orders : $shoppers[$i]->orders;
            $prevRating = count($shopperChanges[$i]) > 0 ? $shopperChanges[$i][0]->rating : $shoppers[$i]->rating;
            $shoppers[$i]->orders_change = $shoppers[$i]->orders - $prevOrder;
            $shoppers[$i]->rating_change = $shoppers[$i]->rating - $prevRating;
        }

        $prevShopperData = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('garendongs', 'garendongs.id', '=', 'orders.garendong_id')
                    ->select(DB::raw('garendongs.id, garendongs.user_id as name, count(orders.rating) as orders, round(avg(orders.rating), 2) as rating'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->whereNotNull('orders.rating')
                    ->groupBy('garendongs.id');
        $prevShopperCount = $prevShopperData->get()->count();
        $prevAvgRating = round($prevShopperData->get()->avg('rating'), 2);           


        $data = array();
        $data['shopper_count'] = array();
        $data['shopper_count']['current'] = $currentShopperCount;
        $data['shopper_count']['prev'] = $prevShopperCount;
        // $data['total_rows'] = $totalRows;
        $data['avg_rating'] = array();
        $data['avg_rating']['current'] = $currentAvgRating;
        $data['avg_rating']['prev'] = $prevAvgRating;
        // $data['avg_rating'] = $avgRating;
        $data['shopper'] = $shoppers;
        // $data['shopper_changes'] = $shopperChanges;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);      
    }

    // USER FEEDBACK
    public function getFeedback(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'stats')
            return $this->getFeedbackStats($query);
    }

    public function getFeedbackStats($query)
    {
        DB::enableQueryLog();
        // execute
        $rating = DB::connection('virtual_market')
                    ->table('garendongs')
                    ->select(DB::raw('sum(num_rating) as transactions, round(avg(rating/num_rating), 2) as value'))
                    ->get();

        $feedback = DB::connection('virtual_market')
                    ->table('user_feedbacks')
                    ->join('reasons', 'user_feedbacks.reason_id', '=', 'reasons.id')
                    // ->join('user_feedbacks', 'user_feedbacks.user_feedback_id', '=', 'user_feedbacks.id')
                    ->join('orders', 'user_feedbacks.order_id', '=', 'orders.id')
                    ->select(DB::raw('reason, count(*)'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('reasons.reason')
                    ->get();

        $data = array();
        $data['rating'] = $rating[0];
        $data['feedback'] = $feedback;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);      
    }

    // BUYER
    public function getBuyer(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'stats')
            return $this->getBuyerStats($query);
        else if($query['type'] == 'history')
            return $this->getBuyerHistory($query);
        else if($query['type'] == 'map')
            return $this->getBuyerMap($query);
    }

    public function getBuyerStats($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        DB::enableQueryLog();
        // execute
        $uniqueBuyers = array();
        $uniqueBuyers['current_period'] = DB::connection('virtual_market')
                                        ->table('orders')
                                        ->join('order_statuses', 'orders.order_status', 'order_statuses.id')
                                        ->where('orders.created_at', '>=', $query['startDate'])
                                        ->where('orders.created_at', '<=', $query['endDate'])
                                        ->where('order_statuses.status', '=', 'success' )
                                        ->distinct('customer_id')
                                        ->count('customer_id');

        $uniqueBuyers['prev_period'] = DB::connection('virtual_market')
                                        ->table('orders')
                                        ->join('order_statuses', 'orders.order_status', 'order_statuses.id')
                                        ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                                        ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                                        ->where('order_statuses.status', '=', 'success' )
                                        ->distinct('customer_id')
                                        ->count('customer_id');


        // buyers who make transactions more than once
        $returningBuyers = array();        
        $returningBuyers['current_period'] = DB::connection('virtual_market')
                    ->table('orders')
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('customer_id')
                    ->havingRaw('count(customer_id) > 1')
                    ->distinct('customer_id')
                    ->count('customer_id');

        $returningBuyers['prev_period'] = DB::connection('virtual_market')
                    ->table('orders')
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->groupBy('customer_id')
                    ->havingRaw('count(customer_id) > 1')
                    ->distinct('customer_id')
                    ->count('customer_id');

        $data = array();
        $data['unique_buyers'] = $uniqueBuyers;
        $data['returning_buyers'] = $returningBuyers;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getBuyerHistory($query)
    {
        $granularity = $this->getGranularity($query['startDate'], $query['endDate']);
        if($granularity == 'month') {
            $dateQuery = 'to_char(orders.created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(orders.created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }

        DB::enableQueryLog();
        // execute
        $buyer = DB::connection('virtual_market')
                    ->table('orders')
                    ->select(DB::raw($dateQuery.',count(distinct customer_id)'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        $data = array();
        $data['granularity'] = $granularity;
        $data['buyer'] = $buyer;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getBuyerMap($query)
    {
        
        DB::enableQueryLog();
        // execute
        $data = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->join('addresses', 'orders.customer_id', '=', 'addresses.user_id')
                    ->select(DB::raw('addresses.user_id, addresses.latitude, addresses.longitude'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->where('order_statuses.status', '=', 'success')
                    // ->groupBy('addresses.district')
                    ->get();

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

}
