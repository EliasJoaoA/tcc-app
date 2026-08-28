<?php

namespace App\Policies;

use App\Models\SupportContact;
use App\Models\User;

class SupportContactPolicy
{
    public function update(User $user, SupportContact $contact): bool
    {
        return $user->id === $contact->user_id;
    }

    public function delete(User $user, SupportContact $contact): bool
    {
        return $user->id === $contact->user_id;
    }
}
