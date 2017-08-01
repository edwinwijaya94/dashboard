<?php

namespace App\Http\Controllers;

// use Validator;
use Auth;
use DateTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use Phpml\Regression\LeastSquares;

class MarketplaceController extends Controller
{
    
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    // ATTRIBUTES
    private $successStatus = 'success';

    // HELPER FUNCTIONS
    public function setDefault()
    {
        $default = array();
        $default['startDate'] = '1960-01-01';
        $default['endDate'] = '2020-01-01';
        $default['type'] = 'stats';
        $default['aggregate'] = 'sum';
        $default['aggregateBy'] = 'subtotal'; // aggregate this column
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

        $query['sentraId'] = $request->query('sentra_id', 1);
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
        $diff = $start->diffInDays($end)+1;
        $start = $start->subDays($diff)->toDateTimeString();
        $end = $end->subDays($diff)->toDateTimeString();
        
        $prevDatePeriod['startDate'] = $start;
        $prevDatePeriod['endDate'] = $end;

        return $prevDatePeriod;
    }

    public function getGranularity($startDate, $endDate) {
        $start = Carbon::createFromFormat('Y-m-d  H:i:s', $startDate);
        $end = Carbon::createFromFormat('Y-m-d  H:i:s', $endDate);
        $diff = $start->diffInDays($end)+1;

        if($diff > 30) {
            $granularity = 'month';
        } else {
            $granularity = 'day';
        }
        return $granularity;
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
        $currentTransactionCount = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('orderline_statuses.name', [$this->successStatus])
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    // ->groupBy('status')
                    ->get();

        $prevTransactionCount = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('orderline_statuses.name', [$this->successStatus])
                    ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                    // ->groupBy('status')
                    ->get();


        // total transaction value
        $currentTransactionValue = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(subtotal), 0), 0) as average'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->get();

        $prevTransactionValue = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(subtotal), 0), 0) as average'))
                    ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->get();

        // transaction status
        $transactionStatus = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->select(DB::raw('orderline_statuses.name, count(*)'))
                    // ->whereIn('status', [$this->successStatus])
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->groupBy('orderline_statuses.name')
                    ->orderByRaw('count desc')
                    ->get();

        // payment method
        $paymentMethod = DB::connection('marketplace')
                    ->table('orders')
                    ->join('payment_method_types', 'orders.payment_method_type_id', '=', 'payment_method_types.id')
                    ->select(DB::raw('payment_method_types.name, count(*)'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    // ->where('status', '=', $this->successStatus)
                    ->groupBy('payment_method_types.name')
                    ->orderByRaw('count desc')
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
        $data['payment_method'] = $paymentMethod;
        
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
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }

        DB::enableQueryLog();
        // execute
        $transaction = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->select(DB::raw($query['aggregate'].'as value, count(*),'.$dateQuery))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
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

        if($query['type'] == 'toplist')
            return $this->getProductTopList($query);
        else if($query['type'] == 'stats')
            return $this->getProductStats($query);
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
        $availability = DB::connection('marketplace')
                    ->table('products')
                    ->select(DB::raw('is_available, count(*)'))
                    ->groupBy('is_available')
                    // ->toSql();
                    ->get();
        // dd ($data);

        // unavailable products
        $unavailableProducts = DB::connection('marketplace')
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
        $rows = (int)$query['rows'];
        $page = (int)$query['page'];
        DB::enableQueryLog();
        // execute
        // success / failed transaction
        $query = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('products', 'orderlines.product_id', '=', 'products.id')
                    ->select(DB::raw('products.name, sum(quantity) as units, sum(orderlines.subtotal) as value'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->orderByRaw('units desc, products.name asc')
                    ->limit(5);

        $product = $query
                    ->get();

        $data = array();
        // $data['total_rows'] = $totalRows;
        $data['product'] = $product;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getProductList($query)
    {
        $rows = (int)$query['rows'];
        $page = (int)$query['page'];
        DB::enableQueryLog();
        // execute
        // success / failed transaction
        $query = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('products', 'orderlines.product_id', '=', 'products.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->join('sentra', 'stores.sentra_id', '=', 'sentra.id')
                    ->select(DB::raw('products.id, products.name, sentra.name as sentra, count(*), sum(quantity) as sums, round(avg(orderlines.subtotal/orderlines.quantity), 0) as avg_price'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->groupBy('sentra.id')
                    ->orderByRaw('sums desc, products.name asc');
                    // ->limit(5);

        $product = $query
                    ->get();

        $data = array();
        // $data['total_rows'] = $totalRows;
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

        DB::enableQueryLog();
        // execute
        $dbQuery = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('products', 'orderlines.product_id', '=', 'products.id')
                    ->join('orders', 'orderlines.order_id', '=', 'orders.id')
                    ->select(DB::raw('sum(quantity) as count, round(avg(subtotal/quantity), 0) as price,'.$dateQuery))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->where('orderlines.product_id', '=', $query['productId'])
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

    // SENTRA
    public function getSentra(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'list')
            return $this->getSentraList();
        else if($query['type'] == 'data')
            return $this->getSentraData($query);
        else if($query['type'] == 'toplist')
            return $this->getSentraTopList($query);
    }

    public function getSentraList()
    {
        DB::enableQueryLog();
        // execute
        $data = DB::connection('marketplace')
                    ->table('sentra')
                    ->select(DB::raw('id, name'))
                    ->get();

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);      
    }

    public function getSentraStats($query)
    {
        DB::enableQueryLog();
        // execute
        $data = DB::connection('marketplace')
                    ->table('sentra')
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

    public function getSentraData($query)
    {
        // config
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        $granularity = $this->getGranularity($query['startDate'], $query['endDate']);
        if($granularity == 'month') {
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }


        $data = array();
        $data['granularity'] = $granularity;

        DB::enableQueryLog();
        // execute
        // TRANSACTION DATA
        // transaction count
        $currentTransactionCount = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw('count(*)'))
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->get();

        $prevTransactionCount = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw('count(*)'))
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->get();


        // total transaction value
        $currentTransactionValue = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(subtotal), 0), 0) as average'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->get();

        $prevTransactionValue = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(subtotal), 0), 0) as average'))
                    ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->get();

        // transaction status
        $transactionStatus = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw('orderline_statuses.name, count(*)'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->groupBy('orderline_statuses.name')
                    ->orderByRaw('count desc')
                    ->get();

        $transactionHistory = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw($query['aggregate'].'as value, count(*),'.$dateQuery))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        // TRANSACTION
        $data['transaction'] = array();
        $data['transaction']['count'] = array();
        $data['transaction']['count']['current'] = $currentTransactionCount[0];
        $data['transaction']['count']['prev'] = $prevTransactionCount[0];
        $data['transaction']['value'] = array();
        $data['transaction']['value']['current'] = $currentTransactionValue[0];
        $data['transaction']['value']['prev'] = $prevTransactionValue[0];
        $data['transaction']['history'] = $transactionHistory;
        $data['transaction']['status'] = $transactionStatus;
        
        // BUYER
        $currentBuyers = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->distinct('buyer_id')
                    ->count('buyer_id');

        $prevBuyers = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->distinct('buyer_id')
                    ->count('buyer_id');

        $buyerHistory = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw($dateQuery.',count(distinct buyer_id)'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        $data['buyer'] = array();
        $data['buyer']['count'] = array();
        $data['buyer']['count']['current'] = $currentBuyers;
        $data['buyer']['count']['prev'] = $prevBuyers;
        $data['buyer']['history'] = $buyerHistory;


        // PRODUCT
        $product = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->join('products', 'orderlines.product_id', '=', 'products.id')
                    ->select(DB::raw('products.name, sum(quantity) as units, sum(orderlines.subtotal) as value'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->groupBy('products.id')
                    ->orderByRaw('units desc, products.name asc')
                    ->limit(5)
                    ->get();

        $data['product'] = $product;

        // RATING
        $currentRating = DB::connection('marketplace')
                    ->table('ratings')
                    ->join('feedbacks', 'ratings.feedback_id', '=', 'feedbacks.id')
                    ->join('orderlines', 'feedbacks.orderline_id', '=', 'orderlines.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw('round(avg(value), 2) as rating'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->get();

        $prevRating = DB::connection('marketplace')
                    ->table('ratings')
                    ->join('feedbacks', 'ratings.feedback_id', '=', 'feedbacks.id')
                    ->join('orderlines', 'feedbacks.orderline_id', '=', 'orderlines.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw('round(avg(value), 2) as rating'))
                    ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->get();

        $ratingTrend = DB::connection('marketplace')
                    ->table('ratings')
                    ->join('feedbacks', 'ratings.feedback_id', '=', 'feedbacks.id')
                    ->join('orderlines', 'feedbacks.orderline_id', '=', 'orderlines.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->select(DB::raw('round(avg(value), 2) as rating,'.$dateQuery))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('stores.sentra_id', '=', $query['sentraId'])
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        $data['rating'] = array();
        $data['rating']['average']['current'] = $currentRating[0]->rating;
        $data['rating']['average']['prev'] = $prevRating[0]->rating;
        $data['rating']['trend'] = $ratingTrend;


        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);      
    }

    public function getSentraTopList($query)
    {
        // $rows = (int)$query['rows'];
        // $page = (int)$query['page'];
        // if($query['sort'] == 'highest')
        //     $ratingOrder = 'orders desc';
        // else if ($query['sort'] == 'lowest')
        //     $ratingOrder = 'orders asc';
        // $ratingOrder .= ', name asc';

        DB::enableQueryLog();
        // execute
        $query = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->join('stores', 'orderlines.store_id', '=', 'stores.id')
                    ->join('sentra', 'stores.sentra_id', '=', 'sentra.id')
                    ->select(DB::raw('sentra.name as name, count(*) as orders, sum(subtotal) as value'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
                    ->groupBy('sentra.name')
                    ->orderByRaw('orders desc')
                    ->limit(5);

        // $totalRows = $query->get()->count();

        $sentra = $query
                    ->get();

        $data = array();
        // $data['total_rows'] = $totalRows;
        $data['sentra'] = $sentra;
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
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        $granularity = $this->getGranularity($query['startDate'], $query['endDate']);
        if($granularity == 'month') {
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }

        DB::enableQueryLog();
        // execute
        $currentRating = DB::connection('marketplace')
                    ->table('ratings')
                    ->join('feedbacks', 'ratings.feedback_id', '=', 'feedbacks.id')
                    ->join('orderlines', 'feedbacks.orderline_id', '=', 'orderlines.id')
                    ->select(DB::raw('round(avg(value), 2) as rating'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->get();

        $prevRating = DB::connection('marketplace')
                    ->table('ratings')
                    ->join('feedbacks', 'ratings.feedback_id', '=', 'feedbacks.id')
                    ->join('orderlines', 'feedbacks.orderline_id', '=', 'orderlines.id')
                    ->select(DB::raw('round(avg(value), 2) as rating'))
                    ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                    ->get();

        $ratingTrend = DB::connection('marketplace')
                    ->table('ratings')
                    ->join('feedbacks', 'ratings.feedback_id', '=', 'feedbacks.id')
                    ->join('orderlines', 'feedbacks.orderline_id', '=', 'orderlines.id')
                    ->select(DB::raw('round(avg(value), 2) as rating,'.$dateQuery))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        $data = array();
        $data['rating']['current'] = $currentRating[0]->rating;
        $data['rating']['prev'] = $prevRating[0]->rating;
        $data['rating_trend'] = array();
        $data['rating_trend']['granularity'] = $granularity;
        $data['rating_trend']['trend'] = $ratingTrend;

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
        $uniqueBuyers['current_period'] = DB::connection('marketplace')
                                        ->table('orderlines')
                                        ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                                        ->where('orderlines.created_at', '>=', $query['startDate'])
                                        ->where('orderlines.created_at', '<=', $query['endDate'])
                                        ->where('orderline_statuses.name', '=', $this->successStatus)
                                        ->distinct('buyer_id')
                                        ->count('buyer_id');

        $uniqueBuyers['prev_period'] = DB::connection('marketplace')
                                        ->table('orderlines')
                                        ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                                        ->where('orderlines.created_at', '>=', $prevPeriod['startDate'])
                                        ->where('orderlines.created_at', '<=', $prevPeriod['endDate'])
                                        ->where('orderline_statuses.name', '=', $this->successStatus)
                                        ->distinct('buyer_id')
                                        ->count('buyer_id');


        // buyers who make transactions more than once
        $returningBuyers = array();        
        $returningBuyers['current_period'] = DB::connection('marketplace')
                    ->table('orders')
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('buyer_id')
                    ->havingRaw('count(buyer_id) > 1')
                    ->distinct('buyer_id')
                    ->count('buyer_id');

        $returningBuyers['prev_period'] = DB::connection('marketplace')
                    ->table('orders')
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->groupBy('buyer_id')
                    ->havingRaw('count(buyer_id) > 1')
                    ->distinct('buyer_id')
                    ->count('buyer_id');

        $data = array();
        $data['unique_buyers'] = $uniqueBuyers;
        // $data['returning_buyers'] = $returningBuyers;
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
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(orderlines.created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }

        DB::enableQueryLog();
        // execute
        $buyer = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('orderline_statuses','orderlines.orderline_status_id','orderline_statuses.id')
                    ->select(DB::raw($dateQuery.',count(distinct buyer_id)'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('orderline_statuses.name', '=', $this->successStatus)
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
        $data = DB::connection('marketplace')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->join('addresses', 'orders.customer_id', '=', 'addresses.user_id')
                    ->select(DB::raw('addresses.user_id, addresses.latitude, addresses.longitude'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->where('order_statuses.status', '=', $this->successStatus)
                    // ->groupBy('addresses.district')
                    ->get();

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

}
