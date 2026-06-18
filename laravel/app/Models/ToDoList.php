<?php
namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ToDoList extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'is_completed',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
