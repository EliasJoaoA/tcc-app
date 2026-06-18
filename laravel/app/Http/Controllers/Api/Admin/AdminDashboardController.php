<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\MapPoint;
use App\Models\User;
use App\Models\Video;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'total_videos' => Video::where('is_active', true)->count(),
                'total_map_points' => MapPoint::where('is_active', true)->count(),
                'total_email_templates' => EmailTemplate::where('is_active', true)->count(),
                'recent_users' => User::latest()->take(10)->get(['id', 'name', 'email', 'role', 'course', 'created_at']),
            ],
            'message' => 'Dashboard stats',
            'status' => 200,
        ]);
    }
}
