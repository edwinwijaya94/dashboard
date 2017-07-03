<?php

namespace App\Http\Controllers;

// use Validator;
use Auth;
use DateTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class MarketplaceController extends Controller
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
        $default['aggregateBy'] = 'subtotal'; // aggregate this column
        $default['decimals'] = 3; // decimal places
        $default['page'] = 1;
        $default['rows'] = 5;
        $default['sort'] = 'highest';
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
        // success rates
        $transactionStatus = DB::connection('marketplace')
                    ->table('orderlines')
                    ->select(DB::raw('status, count(*)'))
                    ->whereIn('status', ['success', 'failed'])
                    ->where('created_at', '>=', $query['startDate'])
                    ->where('created_at', '<=', $query['endDate'])
                    ->groupBy('status')
                    ->get();

        // total transaction
        $currentTransaction = DB::connection('marketplace')
                    ->table('orderlines')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(subtotal), 0), 0) as average'))
                    ->where('created_at', '>=', $query['startDate'])
                    ->where('created_at', '<=', $query['endDate'])
                    ->where('status', '=', 'success')
                    ->get();

        $prevTransaction = DB::connection('marketplace')
                    ->table('orderlines')
                    ->select(DB::raw($query['aggregate'].'as value, coalesce(round(avg(subtotal), 0), 0) as average'))
                    ->where('created_at', '>=', $prevPeriod['startDate'])
                    ->where('created_at', '<=', $prevPeriod['endDate'])
                    ->where('status', '=', 'success')
                    ->get();

        // payment method
        $paymentMethod = DB::connection('marketplace')
                    ->table('orders')
                    ->join('payment_method_types', 'orders.payment_method_type_id', '=', 'payment_method_types.id')
                    ->select(DB::raw('payment_method_types.name, count(*)'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    // ->where('status', '=', 'success')
                    ->groupBy('payment_method_types.name')
                    ->get();        

        $data = array();
        $data['transaction_status'] = $transactionStatus;
        $data['payment_method'] = $paymentMethod;
        $data['transaction'] = array();
        $data['transaction']['current'] = $currentTransaction[0];
        $data['transaction']['prev'] = $prevTransaction[0];
        
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
            $dateQuery = 'to_char(created_at, \'YYYY-MM\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        } else if($granularity == 'day') {
            $dateQuery = 'to_char(created_at, \'YYYY-MM-DD\') as date';
            $dateGroupBy = array('date');
            $dateOrder = 'date asc';
        }

        DB::enableQueryLog();
        // execute
        $transaction = DB::connection('marketplace')
                    ->table('orderlines')
                    ->select(DB::raw($query['aggregate'].'as value, count(*),'.$dateQuery))
                    ->where('created_at', '>=', $query['startDate'])
                    ->where('created_at', '<=', $query['endDate'])
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

        if($query['type'] == 'toplist')
            return $this->getProductTopList($query);
        else if($query['type'] == 'stats')
            return $this->getProductStats($query);
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
                    ->table('order_lines')
                    ->join('products', 'order_lines.product_id', '=', 'products.id')
                    ->join('orders', 'order_lines.order_id', '=', 'orders.id')
                    ->select(DB::raw('products.name, count(*), round(avg(order_lines.price/order_lines.quantity), 2) as avg_price, round((cast(count(case when order_lines.is_available then 1 end) as float)/count(*) *100)::numeric, 2) as availability'))
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('products.id')
                    ->orderByRaw('count desc, products.name asc');

        $totalRows = $query->get()->count();

        $product = $query
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

    // SENTRA
    public function getSentra(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'stats')
            return $this->getSentraStats($query);
        else if($query['type'] == 'toplist')
            return $this->getSentraTopList($query);
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

    public function getSentraTopList($query)
    {
        // $rows = (int)$query['rows'];
        // $page = (int)$query['page'];
        if($query['sort'] == 'highest')
            $ratingOrder = 'orders desc';
        else if ($query['sort'] == 'lowest')
            $ratingOrder = 'orders asc';
        $ratingOrder .= ', name asc';

        DB::enableQueryLog();
        // execute
        $query = DB::connection('marketplace')
                    ->table('orderlines')
                    ->join('store_products', 'store_products.product_id', '=', 'orderlines.product_id')
                    ->join('stores', 'stores.id', '=', 'store_products.store_id')
                    ->join('sentra', 'sentra.id', '=', 'stores.sentra_id')
                    ->select(DB::raw('sentra.name as name, count(*), sum(subtotal) as value'))
                    ->where('orderlines.created_at', '>=', $query['startDate'])
                    ->where('orderlines.created_at', '<=', $query['endDate'])
                    ->where('orderlines.status', '=', 'success')
                    ->groupBy('sentra.name')
                    ->orderByRaw($ratingOrder);

        $totalRows = $query->get()->count();

        $sentra = $query
                    ->get();

        $data = array();
        $data['total_rows'] = $totalRows;
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
        DB::enableQueryLog();
        // execute
        $rating = DB::connection('marketplace')
                    ->table('garendongs')
                    ->select(DB::raw('sum(num_rating) as transactions, round(avg(rating/num_rating), 2) as value'))
                    ->get();

        $feedback = DB::connection('marketplace')
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
        $uniqueBuyers['current_period'] = DB::connection('marketplace')
                                        ->table('orders')
                                        ->where('orders.created_at', '>=', $query['startDate'])
                                        ->where('orders.created_at', '<=', $query['endDate'])
                                        ->distinct('customer_id')
                                        ->count('customer_id');

        $uniqueBuyers['prev_period'] = DB::connection('marketplace')
                                        ->table('orders')
                                        ->where('orders.created_at', '>=', $prevPeriod['startDate'])
                                        ->where('orders.created_at', '<=', $prevPeriod['endDate'])
                                        ->distinct('customer_id')
                                        ->count('customer_id');


        // buyers who make transactions more than once
        $returningBuyers = array();        
        $returningBuyers['current_period'] = DB::connection('marketplace')
                    ->table('orders')
                    ->where('orders.created_at', '>=', $query['startDate'])
                    ->where('orders.created_at', '<=', $query['endDate'])
                    ->groupBy('customer_id')
                    ->havingRaw('count(customer_id) > 1')
                    ->distinct('customer_id')
                    ->count('customer_id');

        $returningBuyers['prev_period'] = DB::connection('marketplace')
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
        $buyer = DB::connection('marketplace')
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
        $data = DB::connection('marketplace')
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
