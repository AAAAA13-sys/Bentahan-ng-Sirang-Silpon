<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function seller(): User
    {
        return User::where('email', 'seller@silicon.test')->firstOrFail();
    }

    private function buyer(): User
    {
        return User::where('email', 'buyer@silicon.test')->firstOrFail();
    }

    private function part(): Listing
    {
        return Listing::where('seller_id', $this->seller()->id)->firstOrFail();
    }

    private function fields(Listing $listing): array
    {
        return $listing->only(['title', 'brand', 'model', 'category', 'condition', 'description', 'diagnostics', 'quantity', 'minimum_quantity', 'stock_version']) + ['price' => number_format($listing->price_centavos / 100, 2, '.', '')];
    }

    private function reserve(Listing $listing): Order
    {
        $this->actingAs($this->buyer())->post(route('reserve', $listing), ['reservation_key' => (string) \Illuminate\Support\Str::uuid(), 'quantity' => 1, 'address' => '123 Demo Street, Pasig City, Metro Manila 1602'])->assertRedirect();

        return Order::latest('id')->firstOrFail();
    }

    public function test_only_owner_can_edit_or_change_visibility(): void
    {
        $part = $this->part();
        foreach ([$this->buyer(), User::where('email', 'parts@silicon.test')->firstOrFail()] as $user) {
            $this->actingAs($user)->get(route('parts.edit', $part))->assertForbidden();
            $this->put(route('parts.update', $part), $this->fields($part))->assertForbidden();
            $this->patch(route('parts.visibility', $part), ['is_active' => 0])->assertForbidden();
        }
        $this->actingAs($this->seller())->get(route('parts.edit', $part))->assertOk()->assertSee('Save changes');
    }

    public function test_pause_hides_listing_and_blocks_stale_reservations_but_preserves_orders(): void
    {
        $part = $this->part();
        $order = $this->reserve($part);
        $this->actingAs($this->seller())->patch(route('parts.visibility', $part), ['is_active' => 0])->assertRedirect('/workspace');
        $this->get(route('parts.show', $part))->assertOk()->assertSee('Paused listing');
        $this->actingAs($this->buyer())->get(route('parts.show', $part))->assertNotFound();
        $this->get('/marketplace')->assertDontSee($part->title);
        $this->get('/')->assertDontSee($part->title)->assertSee('7 listings to explore');
        $this->post(route('reserve', $part), ['reservation_key' => (string) \Illuminate\Support\Str::uuid(), 'quantity' => 1, 'address' => '123 Demo Street, Pasig City, Metro Manila 1602'])->assertStatus(409);
        $this->get(route('orders.show', $order))->assertOk()->assertSee($part->title);
        $this->post(route('orders.update', $order), ['action' => 'cancel'])->assertRedirect();
        $this->assertFalse($part->fresh()->is_active);
        $this->assertSame(8, $part->fresh()->quantity);
        $this->actingAs($this->seller())->patch(route('parts.visibility', $part), ['is_active' => 1])->assertRedirect();
        $this->actingAs($this->buyer())->get('/marketplace')->assertSee($part->title);
    }

    public function test_price_and_specs_are_frozen_at_reservation(): void
    {
        $part = $this->part();
        $order = $this->reserve($part);
        $fields = $this->fields($part->fresh());
        $fields['title'] = 'Updated component title';
        $fields['model'] = 'Different revision';
        $fields['price'] = '999.99';
        $fields['diagnostics'] = 'Updated seller diagnostics after reservation.';
        $fields['seller_id'] = $this->buyer()->id;
        $fields['is_active'] = false;
        $this->actingAs($this->seller())->put(route('parts.update', $part), $fields)->assertRedirect('/workspace');
        $this->assertSame(99999, $part->fresh()->price_centavos);
        $this->assertSame($this->seller()->id, $part->fresh()->seller_id);
        $this->assertTrue($part->fresh()->is_active);
        $this->assertSame($part->title, $order->fresh()->listing_snapshot['title']);
        $this->assertEquals($part->price_centavos, $order->fresh()->total_centavos);
        $this->actingAs($this->buyer())->get(route('orders.show', $order))->assertSee($part->title)->assertSee($part->diagnostics)->assertDontSee('Updated component title')->assertDontSee('Different revision');
        $this->get('/workspace')->assertSee($part->title)->assertDontSee('Updated component title');
    }

    public function test_stale_edit_cannot_overwrite_a_reservation_or_cancellation(): void
    {
        $part = $this->part();
        $old = $this->fields($part);
        $order = $this->reserve($part);
        $this->actingAs($this->seller())->put(route('parts.update', $part), $old)->assertSessionHasErrors('stock_version');
        $this->assertSame(7, $part->fresh()->quantity);
        $beforeCancel = $this->fields($part->fresh());
        $this->actingAs($this->buyer())->post(route('orders.update', $order), ['action' => 'cancel']);
        $this->actingAs($this->seller())->put(route('parts.update', $part), $beforeCancel)->assertSessionHasErrors('stock_version');
        $this->assertSame(8, $part->fresh()->quantity);
    }

    public function test_zero_stock_and_minimum_order_validation(): void
    {
        $part = $this->part();
        $fields = $this->fields($part);
        $fields['quantity'] = 2;
        $fields['minimum_quantity'] = 3;
        $this->actingAs($this->seller())->put(route('parts.update', $part), $fields)->assertSessionHasErrors('minimum_quantity');
        $fields['quantity'] = 0;
        $fields['minimum_quantity'] = 1;
        $this->put(route('parts.update', $part), $fields)->assertRedirect('/workspace');
        $this->get('/marketplace')->assertDontSee($part->title);
        $this->get('/workspace')->assertOk()->assertSee('Insufficient stock');
    }

    public function test_category_art_and_filter_controls_are_consistent(): void
    {
        $this->actingAs($this->seller())->post('/sell', [
            'title' => 'Camera test component', 'brand' => 'OPPO', 'model' => 'Reno test revision',
            'category' => 'Cameras', 'condition' => 'For repair', 'description' => str_repeat('A precise component description. ', 3),
            'diagnostics' => 'Untested camera module. Please inspect before use.', 'price' => '120.00', 'quantity' => 3, 'minimum_quantity' => 1,
        ])->assertRedirect();
        $this->assertDatabaseHas('listings', ['title' => 'Camera test component', 'art' => 'camera']);
        $this->get('/marketplace?q=0')->assertDontSee('iPhone 11 OLED display');
        $this->get('/marketplace?category=Cameras&brand=OPPO')->assertOk()->assertSee('Camera test component')->assertSee('Remove brand filter: OPPO')->assertSee('filter-panel', false);
    }
}
