<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReserveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'buyer';
    }

    public function rules(): array
    {
        return ['reservation_key' => 'required|uuid', 'quantity' => 'required|integer|min:1|max:10000', 'address' => 'required|string|min:15|max:1000'];
    }
}
