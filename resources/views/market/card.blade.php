<article class="product-card">
  <a class="product-image" href="{{ route('parts.show', $listing) }}" aria-label="View {{ $listing->title }}">
    @include('market.art', ['art'=>$listing->art])
    <span class="condition {{ $listing->condition === 'Tested working' ? 'tested' : '' }}">{{ $listing->condition }}</span>
    @if($listing->minimum_quantity > 1)<span class="bulk-tag">MIN. {{ $listing->minimum_quantity }} PCS</span>@endif
  </a>
  <div class="product-body">
    <div class="product-meta"><span>{{ $listing->brand }}</span><span>{{ $listing->category }}</span></div>
    <h3><a href="{{ route('parts.show', $listing) }}">{{ $listing->title }}</a></h3>
    <p class="model">{{ $listing->model }}</p>
    <div class="product-price"><strong>₱{{ number_format($listing->price_centavos / 100, 2) }}</strong><span>/ piece</span><a href="{{ route('parts.show', $listing) }}" class="circle-link" aria-label="View {{ $listing->title }}">@include('market.icon',['name'=>'arrow'])</a></div>
    <div class="seller-line"><span>@if($listing->seller->seller_verified)<span class="verified-icon" title="Verified seller">✓</span>@endif {{ $listing->seller->name }}</span><span>{{ $listing->quantity }} in stock</span></div>
  </div>
</article>
