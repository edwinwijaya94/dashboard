<?php

namespace App\Http\Controllers;

// use Validator;
use Auth;
use DateTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class VirtualMarketController extends Controller
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

        return $default;
    }

    public function setQuery($request, $default)
    {
        $query = array();
        $query['startDate'] = $request->query('start_date', $default['startDate']);
        $query['endDate'] = $request->query('end_date', $default['endDate']);
        $query['type'] = $request->query('type', $default['type']);
        $query['aggregate'] = $request->query('aggregate', $default['aggregate']).'('.$default['aggregateBy'].')';

        // Round results if using avg function
        if($query['aggregate'] == 'avg('.$default['aggregateBy'].')') {
            $query['aggregate'] = 'round('.$query['aggregate'].','.$default['decimals'].')';
        }

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
        
        $start = Carbon::createFromFormat('Y-m-d', $startDate);
        $end = Carbon::createFromFormat('Y-m-d', $endDate);
        $diff = $start->diffInDays($end)+1;
        $start = $start->subDays($diff)->toDateString();
        $end = $end->subDays($diff)->toDateString();

        $prevDatePeriod['startDate'] = $start;
        $prevDatePeriod['endDate'] = $end;

        return $prevDatePeriod;
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
        DB::enableQueryLog();
        // execute
        // success rates
        $transactionStatus = DB::connection('virtual_market')
                    ->table('order')
                    ->join('order_status', 'order.orderstatus_id', '=', 'order_status.id')
                    ->select(DB::raw('status, count(*), sum(total_price)'))
                    ->whereIn('status', ['success', 'failed'])
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->groupBy('status')
                    ->get();

        // app platform (mobile / sms)
        $appPlatform = DB::connection('virtual_market')
                    ->table('order')
                    ->join('order_status', 'order.orderstatus_id', '=', 'order_status.id')
                    ->select(DB::raw('order_type as name, count(*)'))
                    ->where('status', '=', 'success')
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->groupBy('order_type')
                    ->get();

        $data = array();
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
        DB::enableQueryLog();
        // execute
        $data = DB::connection('virtual_market')
                    ->table('order')
                    ->join('order_status', 'order.orderstatus_id', '=', 'order_status.id')
                    ->select(DB::raw($query['aggregate'].'as value, count(*), extract( year from order_at) as yr, extract(month from order_at) as mo '))
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->where('status', '=', 'success')
                    ->groupBy('yr')
                    ->groupBy('mo')
                    ->orderByRaw('yr asc, mo asc')
                    // ->toSql();
                    ->get();
        // dd ($data);

        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

    // COMMODITY
    public function getCommodity(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'toplist')
            return $this->getCommodityTopList($query);
        else if($query['type'] == 'stats')
            return $this->getCommodityStats($query);
    }
    
    public function getCommodityStats($query)
    {
        DB::enableQueryLog();
        // execute
        // product availability
        $availability = DB::connection('virtual_market')
                    ->table('product')
                    ->select(DB::raw('is_available, count(*)'))
                    ->groupBy('is_available')
                    // ->toSql();
                    ->get();
        // dd ($data);

        // unavailable products
        $unavailableProducts = DB::connection('virtual_market')
                    ->table('product')
                    ->select('name')
                    ->where('is_available', '=', false)
                    // ->limit(5)
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

    public function getCommodityTopList($query)
    {
        DB::enableQueryLog();
        // execute
        // success / failed transaction
        $data = DB::connection('virtual_market')
                    ->table('shopping_list')
                    ->join('product', 'shopping_list.product_id', '=', 'product.id')
                    ->join('order', 'shopping_list.order_id', '=', 'order.id')
                    ->select(DB::raw('product.name, count(*)'))
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->groupBy('product.name')
                    ->orderByRaw('count(*) desc')
                    ->limit(5)
                    // ->toSql();
                    ->get();
        // dd ($data);

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
                    'data' => $data
                ]);      
    }

    public function getShopperTopList($query)
    {
        DB::enableQueryLog();
        // execute
        $data = DB::connection('virtual_market')
                    ->table('garendongs')
                    ->select(DB::raw('user_id, rating'))
                    ->orderBy('rating', 'desc')
                    ->limit(5)
                    ->get();

        // $data = array();
        // $data['rating'] = $rating;
        // $data['feedback'] = $feedback;
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
                    ->table('user_feedback')
                    ->join('order', 'user_feedback.order_id', '=', 'order.id')
                    ->select(DB::raw('count(*) as buyer, round(avg(rating), 2) as rating'))
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->get();

        $feedback = DB::connection('virtual_market')
                    ->table('reason_list')
                    ->join('reason', 'reason_list.reason_id', '=', 'reason.id')
                    ->join('user_feedback', 'reason_list.user_feedback_id', '=', 'user_feedback.id')
                    ->join('order', 'user_feedback.order_id', '=', 'order.id')
                    ->select(DB::raw('reason, count(*)'))
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->groupBy('reason.reason')
                    ->get();

        $data = array();
        $data['rating'] = $rating;
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
    }

    public function getBuyerStats($query)
    {
        $prevPeriod = $this->getPrevDatePeriod($query['startDate'], $query['endDate']);

        DB::enableQueryLog();
        // execute
        $uniqueBuyers = array();
        $uniqueBuyers['current_period'] = DB::connection('virtual_market')
                                        ->table('order')
                                        ->where('order_at', '>=', $query['startDate'])
                                        ->where('order_at', '<=', $query['endDate'])
                                        ->distinct('buyer_id')
                                        ->count('buyer_id');

        $uniqueBuyers['prev_period'] = DB::connection('virtual_market')
                                        ->table('order')
                                        ->where('order_at', '>=', $prevPeriod['startDate'])
                                        ->where('order_at', '<=', $prevPeriod['endDate'])
                                        ->distinct('buyer_id')
                                        ->count('buyer_id');


        // buyers who make transactions more than once
        $returningBuyers = array();        
        $returningBuyers['current_period'] = DB::connection('virtual_market')
                    ->table('order')
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->groupBy('buyer_id')
                    ->havingRaw('count(buyer_id) > 1')
                    ->distinct('buyer_id')
                    ->count('buyer_id');

        $returningBuyers['prev_period'] = DB::connection('virtual_market')
                    ->table('order')
                    ->where('order_at', '>=', $prevPeriod['startDate'])
                    ->where('order_at', '<=', $prevPeriod['endDate'])
                    ->groupBy('buyer_id')
                    ->havingRaw('count(buyer_id) > 1')
                    ->distinct('buyer_id')
                    ->count('buyer_id');

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
        DB::enableQueryLog();
        // execute
        $data = DB::connection('virtual_market')
                    ->table('order')
                    ->select(DB::raw('extract( year from order_at) as yr, extract(month from order_at) as mo, count(distinct buyer_id)'))
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->groupBy('yr')
                    ->groupBy('mo')
                    ->get();

        // $data = array();
        // $data['unique_buyers'] = $uniqueBuyers;
        // $data['returning_buyers'] = $returningBuyers;
        $status = $this->setStatus();

        return response()->json([
                    'status' => $status,
                    'data' => $data
                ]);
    }

}
