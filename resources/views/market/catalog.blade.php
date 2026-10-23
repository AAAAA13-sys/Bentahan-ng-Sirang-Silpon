@extends('market.layout')
@section('title','Marketplace — Silicon Trading')
@section('content')
<section class="container page-heading catalog-heading">
  <div><span class="eyebrow">THE COMPONENT MARKETPLACE</span><h1>Find your missing piece<span class="green">.</span></h1><p>Source the right component. Give good technology another chapter.</p></div>
  <a class="inline-link" href="{{ route('about') }}">New here? How it works @include('market.icon',['name'=>'arrow'])</a>
</section>
<section class="container catalog-discovery" aria-label="Find components">
  <form class="catalog-search" action="{{ route('catalog') }}" role="search">
    @include('market.icon',['name'=>'search'])<label class="sr-only" for="catalog-q">Search components</label>
    <input id="catalog-q" name="q" value="{{ $filters['q'] ?? '' }}" placeholder="Search a device, model number or component…" maxlength="100">
    @foreach($filters as $key=>$value) @if(!in_array($key,['q','page']))<input type="hidden" name="{{ $key }}" value="{{ $value }}">@endif @endforeach
    <button class="button dark">Search parts @include('market.icon',['name'=>'arrow'])</button>
  </form>
  <nav class="category-tabs" aria-label="Component categories">
    <a class="{{ empty($filters['category']) ? 'selected' : '' }}" @if(empty($filters['category'])) aria-current="page" @endif href="{{ route('catalog',collect($filters)->except('category')->all()) }}">All components</a>
    @foreach(\App\Http\Controllers\MarketplaceController::CATEGORIES as $category)
    <a class="{{ ($filters['category'] ?? '')===$category ? 'selected' : '' }}" @if(($filters['category'] ?? '')===$category) aria-current="page" @endif href="{{ route('catalog',array_merge($filters,['category'=>$category])) }}">{{ $category }}</a>
    @endforeach
  </nav>
</section>
<section class="container catalog-layout">
  <aside class="filters">
    <details class="filter-panel" open>
      <summary><span>@include('market.icon',['name'=>'filters']) Filters</span><span class="filter-toggle">Refine results</span></summary>
      <form action="{{ route('catalog') }}" class="filter-fields">
        @if(!empty($filters['q']))<input type="hidden" name="q" value="{{ $filters['q'] }}">@endif
        <label for="category">Category</label><select id="category" name="category"><option value="">All components</option>@foreach(\App\Http\Controllers\MarketplaceController::CATEGORIES as $value)<option @selected(($filters['category'] ?? '')===$value)>{{ $value }}</option>@endforeach</select>
        <label for="brand">Brand</label><select id="brand" name="brand"><option value="">All brands</option>@foreach(['Apple','Samsung','Xiaomi','OPPO','Vivo'] as $value)<option @selected(($filters['brand'] ?? '')===$value)>{{ $value }}</option>@endforeach</select>
        <label for="condition">Condition</label><select id="condition" name="condition"><option value="">Any condition</option>@foreach(\App\Http\Controllers\MarketplaceController::CONDITIONS as $value)<option @selected(($filters['condition'] ?? '')===$value)>{{ $value }}</option>@endforeach</select>
        <label for="sort">Sort by</label><select id="sort" name="sort">@foreach(['newest'=>'Newest listings','price-low'=>'Price: low to high','price-high'=>'Price: high to low'] as $value=>$label)<option value="{{ $value }}" @selected(($filters['sort'] ?? 'newest')===$value)>{{ $label }}</option>@endforeach</select>
        <label class="checkbox"><input type="checkbox" name="verified" value="1" @checked(!empty($filters['verified']))> Verified sellers only</label>
        <button class="button dark full">Apply filters</button><a class="reset-filters" href="{{ route('catalog') }}">Clear all filters</a>
      </form>
    </details>
    <div class="filter-note">@include('market.icon',['name'=>'chip'])<strong>Check the exact fit.</strong><p>Match the device model and board revision. Seller verification confirms identity, not component condition.</p></div>
  </aside>
  <div class="catalog-results">
    <div class="results-header"><h2>{{ $filters['category'] ?? 'All components' }} <span>{{ $listings->total() }}</span></h2><span class="results-range">@if($listings->total()){{ $listings->firstItem() }}–{{ $listings->lastItem() }} of {{ $listings->total() }} results @else No matches @endif</span></div>
    @if(count(collect($filters)->except('sort')))
    <div class="active-filters" aria-label="Active filters">
      @foreach(collect($filters)->except('sort') as $key=>$value)
      <a href="{{ route('catalog', collect($filters)->except($key)->all()) }}" aria-label="Remove {{ $key }} filter: {{ $key==='verified' ? 'Verified sellers' : $value }}">{{ $key==='verified' ? 'Verified sellers' : ($key==='q' ? 'Search: '.$value : $value) }} @include('market.icon',['name'=>'close'])</a>
      @endforeach
    </div>
    @endif
    <div class="product-grid catalog-products">@forelse($listings as $listing)@include('market.card')@empty<div class="empty"><span class="category-icon">@include('market.icon',['name'=>'search'])</span><h2>No match on this workbench.</h2><p>Try a broader model name, another brand, or remove a filter.</p><a class="button dark" href="{{ route('catalog') }}">Browse all components @include('market.icon',['name'=>'arrow'])</a></div>@endforelse</div>
    <div class="pagination" aria-label="Results pages">@if($listings->previousPageUrl())<a class="button outline" href="{{ $listings->previousPageUrl() }}">← Previous</a>@endif<span>Page {{ $listings->currentPage() }} of {{ $listings->lastPage() }}</span>@if($listings->nextPageUrl())<a class="button outline" href="{{ $listings->nextPageUrl() }}">Next →</a>@endif</div>
    <p class="sample-note">Prototype catalog. Component artwork is illustrative; confirm diagnostic evidence with the seller.</p>
  </div>
</section>
@endsection
