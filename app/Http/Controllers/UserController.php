<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\User;

class UserController extends Controller
{
    // attributes
    private $governmentRoles = array('dashboard_admin', 'staf_dinas', 'staf_pasar');

    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        if (Auth::attempt(['email' => $email, 'password' => $password])) {
            // Authentication passed...
            return redirect('/');
        } else {
            return redirect('/login');
        }
    }

    public function logout()
    {
        Auth::logout();
        return redirect('/login');
    }    

    public function getUsers()
    {
        $users = DB::connection('user')
                    ->table('users')
                    ->join('roles', 'users.role_id', '=', 'roles.id')
                    ->select(DB::raw('users.id, roles.name as role, users.name, email, password as hashed_password'))
                    ->whereIn('roles.name', $this->governmentRoles)
                    ->get();

        return response()->json([
                    'user' => $users
                ]);
    }

    public function getUser($id)
    {
        $user = DB::connection('user')
                    ->table('users')
                    ->select(DB::raw('id, role_id, name, email, password as hashed_password'))
                    ->where('id', '=', $id)
                    ->get();

        return response()->json([
                    'user' => $user[0]
                ]);
    }

    public function getAuthUser() {
        $userData = Auth::user();
        $user = array();
        $user['name'] = $userData->name;
        $user['role'] = $userData->role->name;

        return response()->json([
                    'user' => $user,
                ]);   
    }

    public function getRoles()
    {
        $roles = DB::connection('user')
                    ->table('roles')
                    ->select(DB::raw('id, name'))
                    ->whereIn('roles.name', $this->governmentRoles)
                    ->get();

        return response()->json([
                    'role' => $roles
                ]);
    }

    public function addUser(Request $request)
    {
        $name = $request->input('name');
        $email = $request->input('email');
        $password = $request->input('password'); 
        $roleId = $request->input('role_id'); 

        $user = User::create([
            'role_id' => $roleId,
            'name' => $name,
            'email' => $email,
            'password' => bcrypt($password),
        ]);

        return response('OK', 200);
    }

    public function editUser(Request $request)
    {
        $id = $request->input('id');
        $name = $request->input('name');
        $email = $request->input('email');
        $isChangePassword = $request->input('is_change_password');
        if($isChangePassword)
            $password = $request->input('password'); 
        $roleId = $request->input('role_id'); 
        
        $user = User::find($id);
        $user->name = $name;
        $user->email = $email;
        if($isChangePassword)
            $user->password = bcrypt($password);
        $user->role_id = $roleId;

        $user->save();

        return response('OK', 200);
    }

    public function deleteUser($id)
    {
        $userCount = $users = DB::connection('user')
                    ->table('users')
                    ->join('roles', 'users.role_id', '=', 'roles.id')
                    ->select(DB::raw('id, roles.name, name, email, password as hashed_password'))
                    ->whereIn('roles.name', $this->governmentRoles)
                    ->count();

        if($userCount <= 1) {
            $status = 'error';
            $message = 'Tidak bisa menghapus pengguna terakhir';
        } else {
            $user = User::find($id);
            $user->delete();    
            $status = 'success';
            $message = 'Pengguna berhasil dihapus';
        }

        return response()->json([
                    'status' => $status,
                    'message' => $message
                ]);
    }


}
