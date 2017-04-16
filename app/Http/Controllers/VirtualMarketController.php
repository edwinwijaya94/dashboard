<?php

namespace App\Http\Controllers;

// use Validator;
use Auth;
use DateTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class VirtualMarketController extends Controller
{
    
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

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
        // success / failed transaction
        $data = DB::connection('virtual_market')
                    ->table('order')
                    ->join('order_status', 'order.orderstatus_id', '=', 'order_status.id')
                    ->select(DB::raw('status, count(*), sum(total_price)'))
                    ->whereIn('status', ['success', 'failed'])
                    ->where('order_at', '>=', $query['startDate'])
                    ->where('order_at', '<=', $query['endDate'])
                    ->groupBy('status')
                    // ->toSql();
                    ->get();
        // dd ($data);

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
                    ->select(DB::raw($query['aggregate'].'as value, extract( year from order_at) as yr, extract(month from order_at) as mo '))
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

        // not available products
        $unavailableProducts = DB::connection('virtual_market')
                    ->table('product')
                    ->select('name')
                    ->where('is_available', '=', false)
                    ->limit(5)
                    // ->toSql();
                    ->get();
        
        $data = array();
        $data['availablity'] = $availability;
        $data['unavailableProducts'] = $unavailableProducts;

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
}
