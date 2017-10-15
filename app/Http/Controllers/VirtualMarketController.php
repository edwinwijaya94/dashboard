<?php

namespace App\Http\Controllers;

// use Validator;
use Auth;
use DateTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use Phpml\Regression\LeastSquares;

class VirtualMarketController extends Controller
{
    
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    // ATTRIBUTES
    private $successStatus = true;
    private $successName = 'Pesanan Anda sudah sampai';
    private $priorityNotAvailable = 'Barang prioritas tidak tersedia';
    private $buyerNotAtHome = 'Tidak ada orang di rumah';
    private $finalTransactionStatus = array('Pesanan Anda sudah sampai', 'Barang prioritas tidak tersedia', 'Tidak ada orang di rumah');

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
        // transaction count
        $currentTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('status', [$this->successStatus])
                    ->whereIn('order_statuses.name', [$this->successName])
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    // ->groupBy('status')
                    ->get();

        $prevTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('count(*)'))
                    ->whereIn('status', [$this->successStatus])
                    ->whereIn('order_statuses.name', [$this->successName])
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
                    ->where('status', '=', $this->successStatus)
                    ->whereIn('order_statuses.name', [$this->successName])
                    ->get();

        $prevTransactionValue = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(total_price), 0), 0) as average'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->where('status', '=', $this->successStatus)
                    ->whereIn('order_statuses.name', [$this->successName])
                    ->get();

        // transaction status
        $transactionStatus = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('case when order_statuses.status then \'sukses\' else order_statuses.name end as status, count(*)'))
                    // ->whereIn('status', [$this->successStatus])
                    ->whereIn('order_statuses.name', $this->finalTransactionStatus)
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('order_statuses.name')
                    ->groupBy('order_statuses.status')
                    ->orderByRaw('count desc')
                    ->get();

        $statuses = DB::connection('virtual_market')
                    ->table('order_statuses')
                    ->select(DB::raw('status'))
                    ->get();

        $statusTrendData = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('status, count(*),'.$dateQuery))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('order_statuses.status')
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();
        $statusTrend = [];
        for($i=0; $i<count($statusTrendData); $i++){
            if(($i == 0) || ($prevDate != $statusTrendData[$i]->date)){
                if($i>0)
                    array_push($statusTrend, $data);
                $data = array();
                $data['date'] = $statusTrendData[$i]->date;
            }
            $data[$statusTrendData[$i]->status] = $statusTrendData[$i]->count;
            $prevDate = $statusTrendData[$i]->date;
            if($i == count($statusTrendData)-1)
                array_push($statusTrend, $data);
        }

        // app platform (mobile / sms)
        $appPlatform = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('order_type as name, count(*)'))
                    ->where('status', '=', $this->successStatus)
                    ->whereIn('order_statuses.name', [$this->successName])
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('order_type')
                    ->get();

        $platforms = array();
        array_push($platforms, array('platform'=>'sms'));
        array_push($platforms, array('platform'=>'mobile'));

        $platformTrendData = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('order_statuses', 'orders.order_status', '=', 'order_statuses.id')
                    ->select(DB::raw('order_type as platform, count(*),'.$dateQuery))
                    ->where('status', '=', $this->successStatus)
                    ->whereIn('order_statuses.name', [$this->successName])
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('order_type')
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        $platformTrend = [];
        for($i=0; $i<count($platformTrendData); $i++){
            if(($i == 0) || ($prevDate != $platformTrendData[$i]->date)){
                if($i>0)
                    array_push($platformTrend, $data);
                $data = array();
                $data['date'] = $platformTrendData[$i]->date;
            }
            $data[$platformTrendData[$i]->platform] = $platformTrendData[$i]->count;
            $prevDate = $platformTrendData[$i]->date;
            if($i == count($platformTrendData)-1)
                array_push($platformTrend, $data);
        }


        $data = array();
        $data['transaction'] = array();
        $data['transaction']['count'] = array();
        $data['transaction']['count']['current'] = $currentTransactionCount[0];
        $data['transaction']['count']['prev'] = $prevTransactionCount[0];
        $data['transaction']['value'] = array();
        $data['transaction']['value']['current'] = $currentTransactionValue[0];
        $data['transaction']['value']['prev'] = $prevTransactionValue[0];

        $data['transaction_status'] = $transactionStatus;
        $data['transaction_status_trend'] = array();
        $data['transaction_status_trend']['statuses'] = $statuses;
        $data['transaction_status_trend']['granularity'] = $granularity;
        $data['transaction_status_trend']['trend'] = $statusTrend;
        $data['app_platform'] = $appPlatform;
        $data['app_platform_trend'] = array();
        $data['app_platform_trend']['platforms'] = $platforms;
        $data['app_platform_trend']['granularity'] = $granularity;
        $data['app_platform_trend']['trend'] = $platformTrend;
        
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
                    ->where('status', '=', $this->successStatus)
                    ->whereIn('order_statuses.name', [$this->successName])
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
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);
        DB::enableQueryLog();
        // execute
        $currentAvailability = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select('*')
                    ->select(DB::raw('count(case when order_lines.is_available then 1 end) as available, count(order_lines.is_available) as total'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->get();
        if($currentAvailability[0]->total > 0)
            $currentAvailability = round(((float)$currentAvailability[0]->available / $currentAvailability[0]->total)*100, 2);
        else 
            $currentAvailability = null;

        $prevAvailability = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('count(case when order_lines.is_available then 1 end) as available, count(order_lines.is_available) as total'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->get();
        if($prevAvailability[0]->total > 0)
            $prevAvailability = round(((float)$prevAvailability[0]->available / $prevAvailability[0]->total)*100, 2);
        else 
            $prevAvailability = null;
        
        // product price
        $product = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('products.id, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->get();

        for($i=0; $i<count($product); $i++) {
            $prevData = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('products.id, round(avg(order_lines.price/order_lines.quantity), 0) as avg_price'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->where('products.id', '=', $product[$i]->id)
                    ->groupBy('products.id')
                    ->get();

            // change in percent
            if(count($prevData) != 0) {
                $product[$i]->price_change = (string) round((float)($product[$i]->avg_price - $prevData[0]->avg_price)/($prevData[0]->avg_price)*100, 2);
            } else {
                $product[$i]->price_change = (string) 0;
            }
        }
        // average price change in percent
        $total = 0;
        for($i=0; $i<count($product); $i++){
            $total += $product[$i]->price_change;
        }
        if(count($product)>0)
            $fluctuation = round(($total / count($product)), 2);
        else 
            $fluctuation = null;

        $data = array();
        $data['availability'] = array();
        $data['availability']['current'] = $currentAvailability;
        $data['availability']['prev'] = $prevAvailability;
        // $data['product'] = $product;
        $data['fluctuation'] = $fluctuation;

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getProductTopList($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);
        DB::enableQueryLog();
        // execute
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
        $data['product'] = $product;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    public function getProductList($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

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


        $currentAvailability = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select('*')
                    ->select(DB::raw('count(case when order_lines.is_available then 1 end) as available, count(order_lines.is_available) as total'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->get();
        if($currentAvailability[0]->total > 0)
            $currentAvailability = round(((float)$currentAvailability[0]->available / $currentAvailability[0]->total)*100, 2);
        else 
            $currentAvailability = null;

        $prevAvailability = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('count(case when order_lines.is_available then 1 end) as available, count(order_lines.is_available) as total'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->get();
        if($prevAvailability[0]->total > 0)
            $prevAvailability = round(((float)$prevAvailability[0]->available / $prevAvailability[0]->total)*100, 2);
        else 
            $prevAvailability = null;

        $availabilityTrend = DB::connection('virtual_market')
                    ->table('order_lines')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('round((cast(count(case when order_lines.is_available then 1 end) as float)/count(*) *100)::numeric, 2) as availability,'.$dateQuery))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        $data = array();
        $data['total_rows'] = $totalRows;
        $data['product'] = $product;
        $data['availability'] = array();
        $data['availability']['current'] = $currentAvailability;
        $data['availability']['prev'] = $prevAvailability;
        $data['availability']['trend'] = array();
        $data['availability']['trend']['granularity'] = $granularity;
        $data['availability']['trend']['trend'] = $availabilityTrend;

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

        if($query['sort'] == 'highest')
            $ratingOrder = 'rating desc, orders desc';
        else if ($query['sort'] == 'lowest')
            $ratingOrder = 'rating asc';
        // $ratingOrder .= ', name asc';

        DB::enableQueryLog();
        // execute
        $currentTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->whereNotNull('orders.rating')
                    ->count();

        $prevTransactionCount = DB::connection('virtual_market')
                    ->table('orders')
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->whereNotNull('orders.rating')
                    ->count();

        $currentAvgRating = DB::connection('virtual_market')
                    ->table('orders')
                    ->select(DB::raw('round(avg(orders.rating), 2) as rating'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->whereNotNull('orders.rating')
                    ->get();

        $prevAvgRating = DB::connection('virtual_market')
                    ->table('orders')
                    ->select(DB::raw('round(avg(orders.rating), 2) as rating'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                    ->whereNotNull('orders.rating')
                    ->get();

        $ratingTrend = DB::connection('virtual_market')
                    ->table('orders')
                    ->select(DB::raw('round(avg(orders.rating), 2) as rating,'.$dateQuery))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->whereNotNull('orders.rating')
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();

        $currentShopperData = DB::connection('virtual_market')
                    ->table('orders')
                    ->join('garendongs', 'garendongs.id', '=', 'orders.garendong_id')
                    ->leftJoin('user_feedbacks', 'orders.id', '=', 'user_feedbacks.order_id')
                    ->select(DB::raw('garendongs.id, garendongs.user_id, count(orders.rating) as orders, round(avg(orders.rating), 2) as rating, count(user_feedbacks) as feedbacks'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->whereNotNull('orders.rating')
                    ->groupBy('garendongs.id')
                    ->orderByRaw($ratingOrder);
        $currentShopperCount = $currentShopperData->get()->count();
        $shoppers = $currentShopperData->get();
        
        $shopperName = DB::connection('user')
                    ->table('users')
                    ->join('roles', 'users.role_id', '=', 'roles.id')
                    ->select(DB::raw('users.id, users.name'))
                    ->where('roles.name', '=', 'garendong')
                    ->orderByRaw('users.id asc')
                    ->get();
        // convert shopperName to associative array
        $names = array();
        for($i=0; $i<count($shopperName); $i++){
            $names[$shopperName[$i]->id] = $shopperName[$i];
        }
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
                    ->get();
                array_push($shopperChanges, $result);
        }
        for($i=0; $i<count($shoppers); $i++){
            $prevOrder = count($shopperChanges[$i]) > 0 ? $shopperChanges[$i][0]->orders : $shoppers[$i]->orders;
            $prevRating = count($shopperChanges[$i]) > 0 ? $shopperChanges[$i][0]->rating : $shoppers[$i]->rating;
            $shoppers[$i]->orders_change = $shoppers[$i]->orders - $prevOrder;
            $shoppers[$i]->rating_change = round((float)($shoppers[$i]->rating - $prevRating), 2);
            $shoppers[$i]->name = $names[$shoppers[$i]->user_id]->name;
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
        


        $data = array();
        $data['transaction_count'] = array();
        $data['transaction_count']['current'] = $currentTransactionCount;
        $data['transaction_count']['prev'] = $prevTransactionCount;
        $data['shopper_count'] = array();
        $data['shopper_count']['current'] = $currentShopperCount;
        $data['shopper_count']['prev'] = $prevShopperCount;
        $data['avg_rating'] = array();
        $data['avg_rating']['current'] = $currentAvgRating[0]->rating;
        $data['avg_rating']['prev'] = $prevAvgRating[0]->rating;
        $data['avg_rating']['trend'] = array();
        $data['avg_rating']['trend']['granularity'] = $granularity;
        $data['avg_rating']['trend']['trend'] = $ratingTrend;
        $data['shopper'] = $shoppers;
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
        // $rating = DB::connection('virtual_market')
        //             ->table('garendongs')
        //             ->select(DB::raw('sum(num_rating) as transactions, round(avg(rating/num_rating), 2) as value'))
        //             ->get();
        $currentFeedbackCount = DB::connection('virtual_market')
                    ->table('user_feedbacks')
                    ->join('orders', 'user_feedbacks.order_id', '=', 'orders.id')
                    ->select(DB::raw('count(*)'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->get();

        $prevFeedbackCount = DB::connection('virtual_market')
                    ->table('user_feedbacks')
                    ->join('orders', 'user_feedbacks.order_id', '=', 'orders.id')
                    ->select(DB::raw('count(*)'))
                    ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                    ->where('orders.created_at', '<=', $prevPeriod['endDate'])
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
                    ->orderByRaw('count desc')
                    ->get();

        // feedback count trend
        // $feedbackTrend = DB::connection('virtual_market')
        //             ->table('user_feedbacks')
        //             ->join('orders', 'user_feedbacks.order_id', '=', 'orders.id')
        //             ->select(DB::raw('count(*),'.$dateQuery))
        //             ->where('orders.created_at', '>=', $query['startDate'])
        //             ->where('orders.created_at', '<=', $query['endDate'])
        //             ->groupBy($dateGroupBy)
        //             ->orderByRaw($dateOrder)
        //             ->get();


        $reasons = DB::connection('virtual_market')
                    ->table('reasons')
                    ->select(DB::raw('reason'))
                    ->get();

        $feedbackTrend = DB::connection('virtual_market')
                    ->table('user_feedbacks')
                    ->join('reasons', 'user_feedbacks.reason_id', '=', 'reasons.id')
                    ->join('orders', 'user_feedbacks.order_id', '=', 'orders.id')
                    ->select(DB::raw('reason, count(*),'.$dateQuery))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('reasons.reason')
                    ->groupBy($dateGroupBy)
                    ->orderByRaw($dateOrder)
                    ->get();
        $trend = [];
        for($i=0; $i<count($feedbackTrend); $i++){
            if(($i == 0) || ($prevDate != $feedbackTrend[$i]->date)){
                if($i>0)
                    array_push($trend, $data);
                $data = array();
                $data['date'] = $feedbackTrend[$i]->date;
            }
            $data[$feedbackTrend[$i]->reason] = $feedbackTrend[$i]->count;
            $prevDate = $feedbackTrend[$i]->date;
            if($i == count($feedbackTrend)-1)
                array_push($trend, $data);
        }        
        
        $data = array();
        $data['count'] = array();
        $data['count']['current'] = $currentFeedbackCount[0]->count;
        $data['count']['prev'] = $prevFeedbackCount[0]->count;
        $data['feedback'] = $feedback;
        $data['trend'] = array();
        $data['trend']['granularity'] = $granularity;
        $data['trend']['reasons'] = $reasons;
        $data['trend']['trend'] = $trend;
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
                                        ->where('order_statuses.status', '=', $this->successStatus )
                                        ->whereIn('order_statuses.name', [$this->successName])
                                        ->distinct('customer_id')
                                        ->count('customer_id');

        $uniqueBuyers['prev_period'] = DB::connection('virtual_market')
                                        ->table('orders')
                                        ->join('order_statuses', 'orders.order_status', 'order_statuses.id')
                                        ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                                        ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                                        ->where('order_statuses.status', '=', $this->successStatus )
                                        ->whereIn('order_statuses.name', [$this->successName])
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
                    ->where('order_statuses.status', '=', $this->successStatus)
                    ->whereIn('order_statuses.name', [$this->successName])
                    // ->groupBy('addresses.district')
                    ->get();

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

}
