<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class FlowReliabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_repeating_a_reservation_does_not_create_another_order(): void
    {
        $part = Listing::first();
        $initial = $part->quantity;
        $buyer = User::where('email', 'buyer@silicon.test')->firstOrFail();
        $body = ['reservation_key' => (string) Str::uuid(), 'quantity' => 1, 'address' => '123 Test Street, Pasig City, Metro Manila 1602'];
        $this->actingAs($buyer)->post(route('reserve', $part), $body)->assertRedirect();
        $order = Order::firstOrFail();
        $this->post(route('reserve', $part), $body)->assertRedirect(route('orders.show', $order));
        $this->assertSame(1, Order::count());
        $this->assertSame($initial - 1, $part->fresh()->quantity);
        $this->post(route('reserve', $part), array_replace($body, ['quantity' => 2]))->assertSessionHasErrors('reservation_key');
        $this->assertSame(1, Order::count());
    }

    public function test_login_returns_a_buyer_to_the_component_they_were_reserving(): void
    {
        $part = Listing::first();
        $this->get(route('parts.show', $part))->assertSee('part='.$part->id, false);
        $this->post('/login', ['email' => 'buyer@silicon.test', 'password' => 'SiliconDemo2026', 'part' => $part->id])->assertRedirect(route('parts.show', $part));
    }

    public function test_buyer_login_from_a_seller_link_does_not_lead_to_a_forbidden_page(): void
    {
        $this->get('/sell')->assertRedirect('/login');
        $this->post('/login', ['email' => 'buyer@silicon.test', 'password' => 'SiliconDemo2026'])->assertRedirect('/workspace');
        $this->get('/workspace')->assertOk()->assertDontSee('Sell a part');
        $this->get('/')->assertDontSee('href="'.route('sell').'"', false);
    }

    public function test_invalid_quantity_can_be_corrected_without_breaking_the_page(): void
    {
        $part = Listing::first();
        $buyer = User::where('email', 'buyer@silicon.test')->firstOrFail();
        $this->actingAs($buyer)->from(route('parts.show', $part))->post(route('reserve', $part), ['reservation_key' => (string) Str::uuid(), 'quantity' => 'wrong', 'address' => '123 Test Street, Pasig City, 1602'])->assertSessionHasErrors('quantity');
        $this->get(route('parts.show', $part))->assertOk()->assertSee('Reserve component');
    }

    public function test_registration_keeps_the_buyers_component_context(): void
    {
        $part = Listing::first();
        $this->post('/register', ['name' => 'New Buyer', 'email' => 'flow@example.test', 'role' => 'buyer', 'location' => 'Pasig', 'password' => 'FlowPassword123', 'password_confirmation' => 'FlowPassword123', 'part' => $part->id])->assertRedirect(route('parts.show', $part));
    }

    public function test_health_identifies_the_application_and_database(): void
    {
        $this->get('/health')->assertOk()->assertJsonPath('application', 'silicon-trading')->assertJsonPath('database', 'connected');
    }
}
