<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\ReserveRequest;
use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class MarketplaceController extends Controller
{
    public const CATEGORIES = ['Donor boards', 'ICs & chips', 'Displays', 'Cameras', 'Bulk lots'];

    public const CONDITIONS = ['Tested working', 'For harvesting', 'For repair'];

    public function index()
    {
        return view('market.home', [
            'listings' => Listing::with('seller')->available()->latest()->take(4)->get(),
            'count' => Listing::available()->count(),
        ]);
    }

    public function catalog(Request $request)
    {
        $filters = $request->validate([
            'q' => 'nullable|string|max:100', 'category' => ['nullable', Rule::in(self::CATEGORIES)],
            'brand' => ['nullable', Rule::in(['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'])],
            'condition' => ['nullable', Rule::in(self::CONDITIONS)],
            'sort' => ['nullable', Rule::in(['newest', 'price-low', 'price-high'])],
            'verified' => 'nullable|in:1',
        ]);
        $query = Listing::with('seller')->available();
        $q = $filters['q'] ?? '';
        if ($q !== '') {
            $query->where(fn ($query) => $query->where('title', 'like', "%{$q}%")
                ->orWhere('model', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"));
        }
        foreach (['category', 'brand', 'condition'] as $key) {
            if ($filters[$key] ?? null) {
                $query->where($key, $filters[$key]);
            }
        }
        if ($filters['verified'] ?? false) {
            $query->whereHas('seller', fn ($q) => $q->where('seller_verified', true));
        }
        match ($filters['sort'] ?? 'newest') {
            'price-low' => $query->orderBy('price_centavos'),
            'price-high' => $query->orderByDesc('price_centavos'),
            default => $query->latest(),
        };

        return view('market.catalog', ['listings' => $query->paginate(12)->withQueryString(), 'filters' => array_filter($filters, fn ($value) => $value !== null && $value !== '')]);
    }

    public function show(Listing $listing)
    {
        abort_unless($listing->is_active || auth()->id() === $listing->seller_id, 404);

        return view('market.detail', ['listing' => $listing->load('seller')]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100', 'email' => 'required|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'role' => ['required', Rule::in(['buyer', 'seller'])], 'location' => 'required|string|max:100',
        ]);
        $user = User::create($data);
        Auth::login($user);
        $request->session()->regenerate();

        if ($user->role === 'buyer' && Listing::available()->whereKey($request->integer('part'))->exists()) {
            return redirect()->route('parts.show', $request->integer('part'))->with('success', 'Your buyer account is ready. You can reserve this component.');
        }

        return redirect()->route('workspace')->with('success', 'Welcome to the circular tech community. Your account is ready.');
    }

    public function login(LoginRequest $request)
    {
        $data = $request->safe()->only(['email', 'password']);
        if (! Auth::attempt($data)) {
            throw ValidationException::withMessages(['email' => 'The email or password is incorrect.']);
        }
        $request->session()->regenerate();

        if ($request->user()->role === 'buyer' && $request->integer('part') > 0 && Listing::available()->whereKey($request->integer('part'))->exists()) {
            $request->session()->forget('url.intended');

            return redirect()->route('parts.show', $request->integer('part'));
        }
        if ($request->user()->role !== 'seller' && str_ends_with((string) $request->session()->get('url.intended'), '/sell')) {
            $request->session()->forget('url.intended');
        }

        return redirect()->intended(route('workspace'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    public function workspace(Request $request)
    {
        $user = $request->user();
        $orders = Order::with(['listing.seller', 'buyer'])->where(function ($q) use ($user) {
            $q->where('buyer_id', $user->id)->orWhereHas('listing', fn ($l) => $l->where('seller_id', $user->id));
        })->latest()->paginate(10);

        return view('market.workspace', [
            'orders' => $orders, 'listings' => Listing::where('seller_id', $user->id)->latest()->get(),
            'openOrderCount' => Order::whereNotIn('status', ['completed', 'cancelled'])->where(function ($query) use ($user) {
                $query->where('buyer_id', $user->id)->orWhereHas('listing', fn ($listing) => $listing->where('seller_id', $user->id));
            })->count(),
            'sellers' => $user->role === 'admin' ? User::where('role', 'seller')->get() : collect(),
        ]);
    }

    public function create(Request $request)
    {
        abort_unless($request->user()->role === 'seller', 403);

        return view('market.sell');
    }

    private function listingData(Request $request, bool $editing = false): array
    {
        $data = $request->validate([
            'title' => 'required|string|max:120', 'brand' => ['required', Rule::in(['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'])],
            'model' => 'required|string|max:100', 'category' => ['required', Rule::in(self::CATEGORIES)],
            'condition' => ['required', Rule::in(self::CONDITIONS)],
            'description' => 'required|string|min:30|max:4000', 'diagnostics' => 'required|string|min:10|max:2000',
            'price' => ['required', 'regex:/^\d{1,6}(\.\d{1,2})?$/', 'numeric', 'min:1', 'max:999999.99'],
            'quantity' => 'required|integer|min:'.($editing ? '0' : '1').'|max:10000',
            'minimum_quantity' => 'required|integer|min:1|max:10000',
        ]);
        if ($data['quantity'] > 0 && $data['minimum_quantity'] > $data['quantity']) {
            throw ValidationException::withMessages(['minimum_quantity' => 'Minimum order cannot exceed available stock.']);
        }
        $data['price_centavos'] = (int) round((float) $data['price'] * 100);
        unset($data['price']);
        $data['art'] = match ($data['category']) {
            'Displays' => 'display', 'Cameras' => 'camera', 'ICs & chips' => 'chip', default => 'board',
        };

        return $data;
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'seller', 403);
        $listing = Listing::create($this->listingData($request) + ['seller_id' => $request->user()->id]);

        return redirect()->route('parts.show', $listing)->with('success', 'Your listing is now live. Diagnostic claims are seller supplied.');
    }

    public function edit(Request $request, Listing $listing)
    {
        abort_unless($request->user()->role === 'seller' && $listing->seller_id === $request->user()->id, 403);

        return view('market.sell', compact('listing'));
    }

    public function updateListing(Request $request, Listing $listing)
    {
        abort_unless($request->user()->role === 'seller' && $listing->seller_id === $request->user()->id, 403);
        $data = $this->listingData($request, true);
        $version = $request->validate(['stock_version' => 'required|integer|min:0']);
        DB::transaction(function () use ($listing, $data, $version) {
            $current = Listing::lockForUpdate()->findOrFail($listing->id);
            if ($current->stock_version !== (int) $version['stock_version']) {
                throw ValidationException::withMessages(['stock_version' => 'This listing changed while you were editing. Reload the page to see current stock before saving again.']);
            }
            $current->fill($data);
            $current->stock_version++;
            $current->save();
        });

        return redirect()->route('workspace')->with('success', 'Listing updated. Existing orders keep their original specifications and total.');
    }

    public function visibility(Request $request, Listing $listing)
    {
        abort_unless($request->user()->role === 'seller' && $listing->seller_id === $request->user()->id, 403);
        $data = $request->validate(['is_active' => 'required|boolean']);
        DB::transaction(function () use ($listing, $data) {
            $current = Listing::lockForUpdate()->findOrFail($listing->id);
            $current->is_active = $data['is_active'];
            $current->stock_version++;
            $current->save();
        });

        return redirect()->route('workspace')->with('success', $data['is_active'] ? 'Listing resumed. Buyers can find it when enough stock is available.' : 'Listing paused. Existing orders can still be fulfilled.');
    }

    public function reserve(ReserveRequest $request, Listing $listing)
    {
        abort_if($listing->seller_id === $request->user()->id, 403, 'You cannot reserve your own listing.');
        abort_unless($request->user()->role === 'buyer', 403, 'A buyer account is required.');
        $data = $request->validated();
        $order = DB::transaction(function () use ($listing, $data, $request) {
            // Serialize a buyer's retries before locking stock, including concurrent submissions.
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $existing = Order::where('buyer_id', $request->user()->id)->where('reservation_key', $data['reservation_key'])->first();
            if ($existing) {
                if ($existing->listing_id !== $listing->id || $existing->quantity !== (int) $data['quantity'] || $existing->address !== $data['address']) {
                    throw ValidationException::withMessages(['reservation_key' => 'This submission was already used for another reservation. Reload the component page and try again.']);
                }

                return $existing;
            }
            $stock = Listing::lockForUpdate()->findOrFail($listing->id);
            abort_unless($stock->is_active, 409, 'This listing has been paused by its seller.');
            if ($data['quantity'] < $stock->minimum_quantity || $data['quantity'] > $stock->quantity) {
                throw ValidationException::withMessages(['quantity' => 'Choose a quantity within the minimum order and available stock.']);
            }
            $totalCentavos = $data['quantity'] * $stock->price_centavos;
            $platformFeeRate = 800;
            $platformFeeCentavos = (int) round(($totalCentavos * $platformFeeRate) / 10000);
            $sellerPayoutCentavos = $totalCentavos - $platformFeeCentavos;

            $order = Order::create([
                'buyer_id' => $request->user()->id, 'listing_id' => $stock->id, 'reservation_key' => $data['reservation_key'],
                'quantity' => $data['quantity'], 'address' => $data['address'],
                'total_centavos' => $totalCentavos,
                'platform_fee_rate' => $platformFeeRate,
                'platform_fee_centavos' => $platformFeeCentavos,
                'seller_payout_centavos' => $sellerPayoutCentavos,
                'listing_snapshot' => $stock->only(['title', 'model', 'condition', 'description', 'diagnostics']),
            ]);
            $stock->quantity -= $data['quantity'];
            $stock->stock_version++;
            $stock->save();

            return $order;
        });

        return redirect()->route('orders.show', $order)->with('success', 'Reservation created. No payment has been collected.');
    }

    public function order(Request $request, Order $order)
    {
        $order->load(['listing.seller', 'buyer']);
        abort_unless(in_array($request->user()->id, [$order->buyer_id, $order->listing->seller_id]), 403);

        return view('market.order', compact('order'));
    }

    public function updateOrder(Request $request, Order $order)
    {
        $data = $request->validate(['action' => ['required', Rule::in(['ship', 'receive', 'complete', 'dispute', 'cancel'])]]);
        DB::transaction(function () use ($request, $order, $data) {
            $order = Order::with('listing')->lockForUpdate()->findOrFail($order->id);
            $buyer = $request->user()->id === $order->buyer_id;
            $seller = $request->user()->id === $order->listing->seller_id;
            abort_unless($buyer || $seller, 403);
            switch ($data['action']) {
                case 'ship':
                    abort_unless($seller && $order->status === 'reserved', 403);
                    $shipping = $request->validate(['courier' => ['required', Rule::in(['LBC', 'J&T', 'Lalamove'])], 'tracking_number' => 'required|string|max:100']);
                    $order->fill($shipping);
                    $order->status = 'shipped';
                    break;
                case 'receive':
                    abort_unless($buyer && $order->status === 'shipped', 403);
                    $order->status = 'inspection';
                    $order->received_at = now();
                    break;
                case 'complete':
                    abort_unless($buyer && $order->status === 'inspection', 403);
                    $order->status = 'completed';
                    break;
                case 'dispute':
                    abort_unless($buyer && $order->status === 'inspection' && now()->lte($order->received_at->copy()->addHours(72)), 403, 'The inspection window has closed.');
                    $report = $request->validate(['dispute' => 'required|string|min:20|max:3000']);
                    $order->dispute = $report['dispute'];
                    $order->status = 'disputed';
                    break;
                case 'cancel':
                    abort_unless($order->status === 'reserved', 403);
                    $stock = Listing::lockForUpdate()->findOrFail($order->listing_id);
                    $stock->quantity += $order->quantity;
                    $stock->stock_version++;
                    $stock->save();
                    $order->status = 'cancelled';
                    break;
            }
            $order->save();
        });

        return back()->with('success', 'Order updated.');
    }

    public function verify(Request $request, User $user)
    {
        abort_unless($request->user()->role === 'admin' && $user->role === 'seller', 403);
        $data = $request->validate(['verified' => 'required|boolean']);
        $user->update(['seller_verified' => $data['verified']]);

        return back()->with('success', 'Seller verification updated.');
    }
}
