<?php

namespace App\Http\Controllers;

// use Validator;
use Auth;
use DateTime;
use Illuminate\Support\Facades\DB;
// use App\Model\Marketplace\Transaction;
use Illuminate\Http\Request;

class MarketplaceController extends Controller
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
        $default['aggregateBy'] = 'amount'; // aggregate by this column
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

    public function getTransaction(Request $request)
    {
        $default = $this->setDefault();
        $query = $this->setQuery($request, $default);

        if($query['type'] == 'sentra')
            return $this->getTransactionBySeller($query);
        else if ($query['type'] == 'history')
            return $this->getTransactionByHistory($query);
    }

    public function getTransactionBySeller($query)
    {
        // execute
        $data = DB::connection('marketplace')
                    ->table('transaction')
                    ->select(DB::raw($query['aggregate'].'as value, seller_id'))
                    ->where('datetime', '>=', $query['startDate'])
                    ->where('datetime', '<=', $query['endDate'])
                    ->groupBy('seller_id')
                    ->get();

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
        $data = DB::connection('marketplace')
                    ->table('transaction')
                    ->select(DB::raw($query['aggregate'].'as value, extract( year from datetime) as yr, extract(month from datetime) as mo '))
                    ->where('datetime', '>=', $query['startDate'])
                    ->where('datetime', '<=', $query['endDate'])
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

}
