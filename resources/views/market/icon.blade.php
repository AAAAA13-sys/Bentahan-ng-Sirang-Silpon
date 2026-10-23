<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
@switch($name)
@case('chip')<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5"/><rect x="9" y="9" width="6" height="6" rx="1"/>@break
@case('filters')<path d="M3 6h18M6 12h12M9 18h6"/>@break
@case('close')<path d="m6 6 12 12M18 6 6 18"/>@break
@case('edit')<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-4L4 15Z"/>@break
@case('search')<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>@break
@case('shield')<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>@break
@case('cycle')<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>@break
@case('truck')<path d="M2 5h12v12H2zM14 9h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>@break
@case('arrow')<path d="M4 12h16m-6-6 6 6-6 6"/>@break
@case('check')<path d="m5 12 4 4L19 6"/>@break
@case('display')<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M10 18h4"/>@break
@case('camera')<rect x="2" y="6" width="20" height="15" rx="3"/><circle cx="12" cy="13" r="4"/><path d="m7 6 2-4h6l2 4"/>@break
@default<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>
@endswitch</svg>
