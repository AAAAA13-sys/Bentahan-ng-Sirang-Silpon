<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function buyer(): User
    {
        return User::where('email', 'buyer@silicon.test')->firstOrFail();
    }

    private function seller(): User
    {
        return User::where('email', 'seller@silicon.test')->firstOrFail();
    }

    public function test_public_pages_and_search(): void
    {
        $this->get('/')->assertOk()->assertSee('New possibilities');
        $this->get('/marketplace?q=PM8150')->assertOk()->assertSee('PM8150 power management IC')->assertDontSee('iPhone 12 Pro donor board');
        $this->get('/marketplace?category=Displays')->assertOk()->assertSee('iPhone 11 OLED display')->assertDontSee('PM8150 power management IC');
        $this->get('/marketplace?sort=invalid')->assertSessionHasErrors('sort');
        $this->get('/how-it-works')->assertOk();
        $this->get('/parts/'.Listing::first()->id)->assertOk();
        $this->get('/sell')->assertRedirect('/login');
    }

    public function test_registration_cannot_grant_admin_or_verification(): void
    {
        $data = ['name' => 'New Seller', 'email' => 'new@example.test', 'password' => 'GoodPassword123', 'password_confirmation' => 'GoodPassword123', 'role' => 'seller', 'location' => 'Pasig', 'seller_verified' => true];
        $this->post('/register', $data)->assertRedirect('/workspace');
        $user = User::where('email', $data['email'])->firstOrFail();
        $this->assertFalse((bool) $user->seller_verified);
        $this->assertNotEquals($data['password'], $user->password);
        $this->post('/logout');
        $this->post('/register', array_merge($data, ['email' => 'hack@example.test', 'role' => 'admin']))->assertSessionHasErrors('role');
    }

    public function test_listing_validation_and_access(): void
    {
        $this->actingAs($this->buyer())->get('/sell')->assertForbidden();
        $this->actingAs($this->seller())->post('/sell', [])->assertSessionHasErrors('title');
        $this->post('/sell', ['title' => 'New donor board', 'brand' => 'Apple', 'model' => 'A2407', 'category' => 'Donor boards', 'condition' => 'For harvesting', 'description' => str_repeat('Honest component description. ', 3), 'diagnostics' => 'Pads inspected. Untested power rails.', 'price' => '123.45', 'quantity' => 5, 'minimum_quantity' => 1])->assertRedirect();
        $this->assertDatabaseHas('listings', ['title' => 'New donor board', 'price_centavos' => 12345, 'seller_id' => $this->seller()->id]);
    }

    public function test_reservation_locks_stock_and_uses_server_price(): void
    {
        $listing = Listing::first();
        $stock = $listing->quantity;
        $this->actingAs($this->buyer())->post('/parts/'.$listing->id.'/reserve', ['reservation_key' => (string) \Illuminate\Support\Str::uuid(), 'quantity' => 2, 'address' => '123 Test Street, Pasig City, 1602', 'total_centavos' => 1])->assertRedirect();
        $order = Order::firstOrFail();
        $this->assertEquals($listing->price_centavos * 2, $order->total_centavos);
        $this->assertEquals($stock - 2, $listing->fresh()->quantity);
        $this->post('/parts/'.$listing->id.'/reserve', ['reservation_key' => (string) \Illuminate\Support\Str::uuid(), 'quantity' => 999, 'address' => '123 Test Street, Pasig City, 1602'])->assertSessionHasErrors('quantity');
        $this->assertEquals(1, Order::count());
        $this->post('/orders/'.$order->id.'/update', ['action' => 'cancel'])->assertRedirect();
        $this->assertEquals($stock, $listing->fresh()->quantity);
        $this->post('/orders/'.$order->id.'/update', ['action' => 'cancel'])->assertForbidden();
        $this->assertEquals($stock, $listing->fresh()->quantity);
    }

    public function test_order_privacy_and_state_transitions(): void
    {
        $listing = Listing::where('seller_id', $this->seller()->id)->first();
        $this->actingAs($this->buyer())->post('/parts/'.$listing->id.'/reserve', ['reservation_key' => (string) \Illuminate\Support\Str::uuid(), 'quantity' => 1, 'address' => '123 Test Street, Pasig City, 1602']);
        $order = Order::firstOrFail();
        $this->get('/orders/'.$order->id)->assertOk()->assertSee('No payment');
        $this->post('/orders/'.$order->id.'/update', ['action' => 'ship', 'courier' => 'LBC', 'tracking_number' => 'TEST123'])->assertForbidden();
        $stranger = User::factory()->create();
        $this->actingAs($stranger)->get('/orders/'.$order->id)->assertForbidden();
        $this->actingAs($this->seller())->post('/orders/'.$order->id.'/update', ['action' => 'ship', 'courier' => 'LBC', 'tracking_number' => 'TEST123'])->assertRedirect();
        $this->actingAs($this->buyer())->post('/orders/'.$order->id.'/update', ['action' => 'receive'])->assertRedirect();
        $this->assertEquals('inspection', $order->fresh()->status);
        $this->travel(73)->hours();
        $this->post('/orders/'.$order->id.'/update', ['action' => 'dispute', 'dispute' => 'Component has damaged pads and does not match.'])->assertForbidden();
        $this->post('/orders/'.$order->id.'/update', ['action' => 'complete'])->assertRedirect();
        $this->assertEquals('completed', $order->fresh()->status);
    }

    public function test_only_admin_can_verify_sellers(): void
    {
        $seller = $this->seller();
        $this->actingAs($this->buyer())->post('/sellers/'.$seller->id.'/verify', ['verified' => 0])->assertForbidden();
        $this->actingAs(User::where('role', 'admin')->first())->post('/sellers/'.$seller->id.'/verify', ['verified' => 0])->assertRedirect();
        $this->assertFalse((bool) $seller->fresh()->seller_verified);
    }
}
