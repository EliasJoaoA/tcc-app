<?php

namespace App\Policies;

use App\Models\ProfessorContact;
use App\Models\User;

class ProfessorContactPolicy
{
    public function update(User $user, ProfessorContact $contact): bool
    {
        return $user->id === $contact->user_id;
    }

    public function delete(User $user, ProfessorContact $contact): bool
    {
        return $user->id === $contact->user_id;
    }
}
