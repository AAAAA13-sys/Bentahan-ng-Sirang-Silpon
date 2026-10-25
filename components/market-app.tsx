'use client';
import type { AnchorHTMLAttributes } from 'react';
function Link(props: AnchorHTMLAttributes<HTMLAnchorElement>) { return <a {...props} />; }
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  Cpu, Search, ShieldCheck, ShieldAlert, Truck, Recycle, ArrowUpRight, Camera,
  Monitor, Package, Plus, CheckCircle2, AlertTriangle, Clock, RefreshCw, X, ZoomIn,
  Sun, Moon, ArrowRight, UserCheck, Shield, Layers, ArrowLeft, MapPin, Copy, Check, ExternalLink,
  Database
} from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  location: string;
  sellerVerified: boolean;
};

type Listing = {
  id: number;
  sellerId: string;
  title: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  boardClass?: string;
  storageGb?: string;
  ramGb?: string;
  icCode?: string;
  description: string;
  diagnostics: string;
  priceCentavos: number;
  quantity: number;
  minimumQuantity: number;
  art: string;
  isActive: boolean;
  stockVersion: number;
  seller: User;
};

type Order = {
  id: number;
  buyerId: string;
  listingId: number;
  quantity: number;
  totalCentavos: number;
  platformFeeRate: number;
  platformFeeCentavos: number;
  sellerPayoutCentavos: number;
  status: string;
  address: string;
  courier?: string;
  trackingNumber?: string;
  receivedAt?: string;
  dispute?: string;
  createdAt: string;
  listingSnapshot: {
    title: string;
    model: string;
    condition: string;
    boardClass?: string;
    storageGb?: string;
    ramGb?: string;
    icCode?: string;
    description: string;
    diagnostics: string;
  };
  listing: Listing;
  buyer: User;
};

const categories = ['Donor boards', 'ICs & chips', 'Displays', 'Cameras', 'Bulk lots'] as const;
const brands = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'] as const;
const conditions = ['Tested working', 'For harvesting', 'For repair'] as const;
const boardClasses = [
  'Grade A (Complete / All ICs)',
  'Grade B (Partial Donor / Key ICs)',
  'Grade C (Pure Scrap / Refining)',
] as const;
const storageTiers = ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1024GB (1TB)'] as const;
const ramTiers = ['512MB', '1GB', '2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] as const;

const authenticListingImages: Record<string, string> = {
  'Donor boards': '/images/listings/listing_iphone_board_clean.jpg',
  'ICs & chips': '/images/listings/listing_samsung_exynos_chip.jpg',
  'Displays': '/images/listings/listing_cracked_screens_pile.jpg',
  'Cameras': '/images/listings/listing_dual_camera_sensor.jpg',
  'Bulk lots': '/images/listings/listing_cell_phone_trash_bulk.jpg',
  'board': '/images/listings/listing_iphone_board_clean.jpg',
  'chip': '/images/listings/listing_samsung_exynos_chip.jpg',
  'display': '/images/listings/listing_cracked_screens_pile.jpg',
  'camera': '/images/listings/listing_dual_camera_sensor.jpg',
};

const money = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n / 100);

const date = (s: string) =>
  new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }).format(new Date(s));

class RequestError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function api<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({ error: 'The server returned an unreadable response.' }));
  if (!response.ok) {
    throw new RequestError(response.status, data.error || 'Something went wrong. Please try again.', data.fields);
  }
  return data;
}

function useRemote<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    api<T>(url)
      .then(v => {
        if (active) setData(v);
      })
      .catch(e => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [url, version]);

  return { data, error, reload: () => setVersion(x => x + 1) };
}

function Remote({
  error,
  retry,
  loading,
  children,
}: {
  error: string;
  retry: () => void;
  loading: boolean;
  children: ReactNode;
}) {
  if (error) {
    return (
      <div className="notice error" role="alert">
        {error} <button className="button outline small" onClick={retry}>Try again</button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="empty" role="status">
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
        Loading from the workbench…
      </div>
    );
  }
  return <>{children}</>;
}

function Art({
  art = 'board',
  className = '',
  alt = 'Reclaimed component listing',
}: {
  art?: string;
  className?: string;
  alt?: string;
}) {
  let src = art;
  if (!src || src === 'board' || src === 'chip' || src === 'display' || src === 'camera') {
    src = authenticListingImages[art || 'board'] || '/images/listings/listing_iphone_board_clean.jpg';
  } else if (!src.startsWith('/') && !src.startsWith('http')) {
    src = authenticListingImages[src] || '/images/listings/listing_iphone_board_clean.jpg';
  }
  return (
    <img
      className={`part-art ${className}`}
      src={src}
      alt={alt}
      width="360"
      height="240"
      loading="lazy"
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  );
}

function Heading({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="page-heading heading-row">
      <div>
        <span className="eyebrow">SILICON TRADING / THE WORKBENCH</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  value,
  defaultValue,
  required = true,
  children,
  onChange,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  children?: ReactNode;
  min?: number;
  max?: number;
  step?: string;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) {
  const inputProps = value !== undefined ? { value, onChange } : { defaultValue, onChange };
  return (
    <label>
      {label}
      {children ? (
        <select name={name} required={required} {...inputProps} {...props}>
          {children}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} required={required} rows={4} {...inputProps} {...props} />
      ) : (
        <input name={name} type={type} required={required} {...inputProps} {...props} />
      )}
    </label>
  );
}

function Errors({ error, fields }: { error: string; fields?: Record<string, string> }) {
  return error ? (
    <div role="alert" className="notice error">
      <strong>{error}</strong>
      {fields && (
        <ul>
          {Object.entries(fields).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : null;
}

function Card({ listing: l }: { listing: Listing }) {
  const isTested = l.condition === 'Tested working';
  const isHarvest = l.condition === 'For harvesting';
  const condBg = isTested ? 'rgba(5, 150, 105, 0.92)' : isHarvest ? 'rgba(217, 119, 6, 0.92)' : 'rgba(37, 99, 235, 0.92)';
  const cleanGrade = l.boardClass ? l.boardClass.replace(/ \([^)]*\)/g, '') : '';

  return (
    <Link href={`/parts/${l.id}`} className="product-card">
      <div className="product-art">
        <span className="condition" style={{ background: condBg, color: '#ffffff', border: 'none' }}>
          {l.condition}
        </span>
        {cleanGrade && <span className="board-class-tag">{cleanGrade}</span>}
        {l.minimumQuantity > 1 && <span className="bulk-tag">MIN. {l.minimumQuantity} PCS</span>}
        <Art art={l.art} alt={l.title} />
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{l.brand} · {l.category}</span>
          <span className="memory-spec">{l.storageGb || '128GB'} / {l.ramGb || '6GB'}</span>
        </div>
        <h3>{l.title}</h3>
        <p className="model">{l.model}</p>
        {l.icCode && (
          <div className="ic-code-sub">
            <span>IC:</span> <code>{l.icCode}</code>
          </div>
        )}
        <div className="product-price">
          <strong>{money(l.priceCentavos)}</strong>
          <span>/ unit</span>
          <span className="circle-link">↗</span>
        </div>
        <div className="seller-line">
          <span>
            {l.seller.name} {l.seller.sellerVerified && <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>}
          </span>
          <span>{l.quantity} in stock</span>
        </div>
      </div>
    </Link>
  );
}

function Home({ user }: { user: User | null }) {
  const remote = useRemote<{ listings: Listing[]; total: number }>('/api/market/catalog');
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" />THE FUTURE IS RECLAIMED
          </span>
          <h1>
            Good parts.<br />New possibilities<span className="green">.</span>
          </h1>
          <p>
            The next great repair starts with what’s already here. Discover reclaimed smartphone motherboards, donor logic boards, and micro-soldering IC chips across the Philippines.
          </p>
          <form
            action="/marketplace"
            method="GET"
            className="hero-search"
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input && e.target !== input && !(e.target as HTMLElement).closest('button')) {
                input.focus();
              }
            }}
          >
            <Search size={19} className="hero-search-icon" />
            <input
              id="hero-q"
              name="q"
              type="text"
              aria-label="Search components"
              placeholder="Search components (e.g. iPhone 13, Snapdragon, Grade A)..."
              autoComplete="off"
              maxLength={100}
              className="hero-search-input"
            />
            <button type="submit" className="button green-bg">Find parts ↗</button>
          </form>
          <div className="hero-tags">
            <span>Popular searches</span>
            <Link href="/marketplace?q=iPhone">iPhone boards ↗</Link>
            <Link href="/marketplace?category=ICs+%26+chips">Power ICs ↗</Link>
            <Link href="/marketplace?category=Bulk+lots">Bulk lots ↗</Link>
            <Link href="/marketplace?storageGb=128GB">128GB Boards ↗</Link>
            <Link href="/marketplace?storageGb=256GB">256GB Flagships ↗</Link>
          </div>
          <div className="hero-note">
            <Recycle size={16} /> Less e-waste. More working devices in the circular economy.
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-top">
            <span><span className="live-dot" /> LIVE HARVESTING PIPELINE</span>
            <span>PHILIPPINES E-WASTE HUB</span>
          </div>
          <div className="hero-board">
            <img src="/images/listings/listing_iphone_a14_macro.jpg" alt="Featured reclaimed A14 logic board" />
          </div>
          <div className="floating-label">
            <span className="tiny-label">VERIFIED SILICON RECLAIM</span>
            <strong>A14 Bionic Logic Board · Grade A</strong>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#a4beba' }}>
              Tested 0.75A normal boot · Solder pads intact
            </p>
          </div>
          <div className="visual-bottom">
            <span>RECLAIMED NOT REPLACED</span>
            <span>↻ 100% CIRCULAR TECH</span>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <div className="container trust-items">
          <span><ShieldCheck /> Seller verification</span>
          <span><Cpu /> IC & storage graded</span>
          <span><Truck /> Seller-arranged shipping</span>
          <span><Recycle /> Built for circular tech</span>
        </div>
      </div>

      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR NEXT FIX</span>
            <h2>A part for every possibility.</h2>
          </div>
          <Link className="inline-link" href="/marketplace">Explore marketplace ↗</Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => {
            const Icon = [Cpu, Cpu, Monitor, Camera, Package][i];
            return (
              <Link className="category-card" href={`/marketplace?category=${encodeURIComponent(c)}`} key={c}>
                <span className="category-icon"><Icon /></span>
                <h3>{c}</h3>
                <span>{['The starting point.', 'Small but essential.', 'A fresh perspective.', 'Bring focus back.', 'More parts. More potential.'][i]}</span>
                <b>↗</b>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">STRAIGHT FROM THE WORKBENCH</span>
            <h2>Ready for a second life.</h2>
          </div>
          <Link className="inline-link" href="/marketplace">View all components ↗</Link>
        </div>
        <Remote error={remote.error} retry={remote.reload} loading={!remote.data}>
          <div className="product-grid">
            {remote.data?.listings.slice(0, 8).map(l => (
              <Card key={l.id} listing={l} />
            ))}
          </div>
          {remote.data?.listings.length === 0 && (
            <div className="empty">The workbench is open. New components will appear when sellers publish them.</div>
          )}
        </Remote>
      </section>

      <section className="container story-banner">
        <div className="story-symbol"><Recycle /></div>
        <div>
          <span className="eyebrow">THE CIRCULAR ADVANTAGE</span>
          <h2>A broken phone isn’t<br />the end of the story.</h2>
          <p>Connect the parts sitting on your workbench with the technicians who know how to revive them.</p>
          <Link className="button dark" href={!user || user.role === 'seller' ? '/sell' : '/marketplace'}>
            {!user || user.role === 'seller' ? 'Start selling' : 'Browse components'} ↗
          </Link>
        </div>
        <div className="story-aside">
          <span>COLLECT.</span>
          <span>CONNECT.</span>
          <span className="green">RECREATE.</span>
          <Link href="/how-it-works">See how the pipeline works ↗</Link>
        </div>
      </section>
      <About compact />
    </>
  );
}

function Catalog() {
  const params = useSearchParams();
  const query = params.toString();
  const isBulkCategory = params.get('category') === 'Bulk lots';
  const remote = useRemote<{ listings: Listing[]; total: number; page: number; pages: number }>(
    `/api/market/catalog?${query}`
  );

  return (
    <div className="container">
      <Heading
        title={isBulkCategory ? 'Bulk Scrap & Wholesale Lots.' : 'Find your next fix.'}
        text={
          isBulkCategory
            ? 'Motherboard trays, bawas-kalat scrap lots, and mixed donor boards for technicians, schools, and refining.'
            : 'Reclaimed components. Clear diagnostics. Graded storage & IC classes.'
        }
      />
      <div className="catalog-tabs">
        <Link
          href="/marketplace"
          className={`catalog-tab ${!params.get('category') ? 'active' : ''}`}
        >
          All Components
        </Link>
        {categories.map(c => (
          <Link
            key={c}
            href={`/marketplace?category=${encodeURIComponent(c)}`}
            className={`catalog-tab ${params.get('category') === c ? 'active' : ''}`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="catalog-layout">
        <aside className="filters">
          <form action="/marketplace" key={query}>
            <div className="filter-title">
              <h2>Refine your search</h2>
              <Link href="/marketplace">Reset all</Link>
            </div>
            <Field
              label="Search"
              name="q"
              value={params.get('q') || ''}
              placeholder="e.g. A14, Exynos, 256GB"
              required={false}
            />
            <Field
              label="Storage (ROM Class)"
              name="storageGb"
              value={params.get('storageGb') || ''}
              required={false}
            >
              <option value="">All Capacities (4GB - 1TB)</option>
              {storageTiers.map(t => (
                <option key={t} value={t}>{t} ROM</option>
              ))}
            </Field>
            <Field
              label="Board Scrap Grade"
              name="boardClass"
              value={params.get('boardClass') || ''}
              required={false}
            >
              <option value="">All Scrap Grades</option>
              {boardClasses.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Field>
            {[
              ['Category', 'category', categories],
              ['Brand', 'brand', brands],
              ['Condition', 'condition', conditions],
              ['Sort by', 'sort', ['newest', 'price-low', 'price-high']],
            ].map(([label, key, options]) => (
              <Field
                key={key as string}
                label={label as string}
                name={key as string}
                value={params.get(key as string) || ''}
                required={false}
              >
                <option value="">{key === 'sort' ? 'Newest first' : 'All'}</option>
                {(options as string[]).map(v => (
                  <option key={v} value={v}>
                    {({ 'price-low': 'Price: low to high', 'price-high': 'Price: high to low', newest: 'Newest first' } as Record<string, string>)[v] || v}
                  </option>
                ))}
              </Field>
            ))}
            <label className="checkbox">
              <input
                type="checkbox"
                name="verified"
                value="1"
                defaultChecked={params.get('verified') === '1'}
              />
              Verified sellers only
            </label>
            <button className="button dark full">Apply filters</button>
          </form>
          <p className="filter-note">
            Check model compatibility, ROM/RAM class and diagnostics. A second life starts with the right fit.
          </p>
        </aside>

        <section>
          <Remote error={remote.error} retry={remote.reload} loading={!remote.data}>
            <div className="results-header">
              <span>{remote.data?.total} components available</span>
              <span>PHP · Philippines</span>
            </div>
            <div className="product-grid catalog-products">
              {remote.data?.listings.map(l => (
                <Card key={l.id} listing={l} />
              ))}
            </div>
            {remote.data?.listings.length === 0 && (
              <div className="empty">
                <h3>No components found.</h3>
                <p>Try a different device, category, capacity, or scrap grade.</p>
                <Link className="button outline" href="/marketplace">Clear filters</Link>
              </div>
            )}
            <div className="pagination">
              {remote.data &&
                Array.from({ length: remote.data.pages }, (_, i) => {
                  const p = new URLSearchParams(query);
                  p.set('page', String(i + 1));
                  return (
                    <Link
                      aria-current={remote.data?.page === i + 1 ? 'page' : undefined}
                      className="button outline"
                      key={i}
                      href={`/marketplace?${p}`}
                    >
                      {i + 1}
                    </Link>
                  );
                })}
            </div>
          </Remote>
        </section>
      </div>
    </div>
  );
}

function Auth({ register, onAuth }: { register: boolean; onAuth: (u: User) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields(undefined);
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      const { user } = await api<{ user: User }>(`/api/account/${register ? 'register' : 'login'}`, 'POST', body);
      onAuth(user);
      const part = params.get('part');
      router.push(
        part && user.role === 'buyer'
          ? `/parts/${encodeURIComponent(part)}`
          : params.get('next') === '/sell' && user.role === 'seller'
          ? '/sell'
          : '/workspace'
      );
    } catch (e) {
      setError((e as Error).message);
      setFields((e as RequestError).fields);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth-layout">
      <section className="auth-story">
        <span className="eyebrow">GOOD TECH DESERVES ANOTHER CHANCE</span>
        <h1>Welcome to the<br />next chapter.</h1>
        <p>A community for the people who see potential in every circuit.</p>
        <div className="auth-art"><Art /></div>
        <span className="eyebrow">COLLECT. CONNECT. RECREATE.</span>
      </section>
      <section className="auth-panel">
        <h2>{register ? 'Join the workbench.' : 'Good to see you again.'}</h2>
        <p>{register ? 'Create your account to get started.' : 'Log in to keep your next repair moving.'}</p>
        <Errors error={error} fields={fields} />
        <form className="form" onSubmit={submit}>
          {register && <Field label="Full name" name="name" maxLength={100} autoComplete="name" />}
          <Field
            label={register ? 'Email address' : 'Email or existing username'}
            name="email"
            type={register ? 'email' : 'text'}
            maxLength={254}
            autoComplete="username"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={register ? 'new-password' : 'current-password'}
          />
          {register && (
            <>
              <Field
                label="Confirm password"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
              />
              <Field label="Location" name="location" maxLength={150} />
              <Field label="I’m here to" name="role">
                <option value="buyer">Buy components</option>
                <option value="seller">Sell components</option>
              </Field>
              <p className="muted">
                Use a strong password with at least 8 characters, uppercase and lowercase letters, a number and a symbol.
              </p>
            </>
          )}
          <button disabled={busy} className="button dark full">
            {busy ? 'Please wait…' : register ? 'Create account ↗' : 'Log in ↗'}
          </button>
        </form>
        <p className="auth-switch">
          {register ? 'Already a member?' : 'New to Silicon Trading?'}{' '}
          <Link href={`${register ? '/login' : '/register'}?${params}`}>
            {register ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </div>
  );
}

function Gate({ user, role, children }: { user: User | null; role?: string; children: ReactNode }) {
  const pathname = usePathname();
  if (!user) {
    return (
      <div className="container">
        <Heading title="Your workbench awaits." text="Log in to access your private marketplace workspace." />
        <Link className="button dark" href={`/login${pathname === '/sell' ? '?next=/sell' : ''}`}>
          Log in ↗
        </Link>
      </div>
    );
  }
  if (role && user.role !== role) {
    return (
      <div className="container">
        <Heading title="A seller account is required." text="Your current account cannot manage component listings." />
        <Link className="button dark" href="/workspace">My workspace</Link>
      </div>
    );
  }
  return <>{children}</>;
}

function Detail({ id, user }: { id: string; user: User | null }) {
  const remote = useRemote<{ listing: Listing }>(`/api/market/parts/${id}`);
  return (
    <div className="container">
      <div className="breadcrumbs">
        <Link href="/marketplace">Marketplace</Link> / Component details
      </div>
      <Remote error={remote.error} retry={remote.reload} loading={!remote.data}>
        {remote.data && <DetailContent listing={remote.data.listing} user={user} onListingReload={remote.reload} />}
      </Remote>
    </div>
  );
}

function MacroModal({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  return (
    <div className="macro-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="macro-modal-header" onClick={e => e.stopPropagation()}>
        <div>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--green)', textTransform: 'uppercase' }}>
            High-Resolution Macro Inspection (Micro-Soldering & Trace Integrity)
          </span>
          <h3 style={{ margin: '4px 0 0', color: '#fff', fontSize: '16px' }}>{title}</h3>
        </div>
        <button className="modal-close" onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
          <X size={18} />
        </button>
      </div>
      <div className="macro-img-wrap" onClick={e => e.stopPropagation()}>
        <img src={src} alt={title} />
      </div>
    </div>
  );
}

function ReservationModal({
  listing: l,
  onClose,
  onSuccess,
  onReloadListing,
}: {
  listing: Listing;
  onClose: () => void;
  onSuccess: (orderId: number) => void;
  onReloadListing: () => void;
}) {
  const [quantity, setQuantity] = useState(l.minimumQuantity);
  const [address, setAddress] = useState('');
  const [key] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isConflict, setIsConflict] = useState(false);

  // Financial transparency: calculations based on backend rules (centavos)
  const unitPrice = l.priceCentavos;
  const totalCentavos = quantity * unitPrice;
  const platformFeeCentavos = Math.round((totalCentavos * 800) / 10000); // 8% fee
  const sellerPayoutCentavos = totalCentavos - platformFeeCentavos;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setIsConflict(false);

    try {
      const { order } = await api<{ order: Order }>(`/api/market/parts/${l.id}/reserve`, 'POST', {
        reservationKey: key,
        quantity,
        address,
      });
      onSuccess(order.id);
    } catch (err) {
      const reqErr = err as RequestError;
      if (reqErr.status === 409) {
        setIsConflict(true);
        setError('409 Conflict: This reservation could not be completed because the listing inventory changed or was paused. Please reload to inspect available stock.');
      } else {
        setError(reqErr.message || 'Unable to place reservation.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow" style={{ color: 'var(--green)' }}>RESERVATION ESCROW</span>
            <h3>Reserve Reclaimed Component</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
            <Art art={l.art} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '15px' }}>{l.title}</strong>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {l.brand} · {l.model} · {l.condition}
            </span>
          </div>
        </div>

        {isConflict && (
          <div className="notice conflict" role="alert">
            <div>
              <strong>409 Conflict: Stale Listing State</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{error}</p>
            </div>
            <button
              className="button outline small"
              onClick={() => {
                onReloadListing();
                onClose();
              }}
            >
              Reload Listing
            </button>
          </div>
        )}

        {error && !isConflict && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Order Quantity ({l.minimumQuantity} min · {l.quantity} in stock)
            <div className="qty-stepper">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity(q => Math.max(l.minimumQuantity, q - 1))}
                disabled={quantity <= l.minimumQuantity}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input
                className="qty-input"
                type="number"
                min={l.minimumQuantity}
                max={l.quantity}
                value={quantity}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (val >= l.minimumQuantity && val <= l.quantity) setQuantity(val);
                }}
                required
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity(q => Math.min(l.quantity, q + 1))}
                disabled={quantity >= l.quantity}
                aria-label="Increase quantity"
              >
                +
              </button>
              <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px' }}>
                {quantity === l.quantity ? '(Stock ceiling reached)' : ''}
              </span>
            </div>
          </label>

          <label>
            Delivery Address (Philippines)
            <textarea
              name="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Unit 3B, Raon Electronic Center, Gonzalo Puyat St, Quiapo, Manila, 1001 Metro Manila"
              minLength={15}
              maxLength={1000}
              rows={3}
              required
            />
          </label>

          <div className="fee-breakdown-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
              <span>Financial Transparency Breakdown</span>
              <span style={{ color: 'var(--green)', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>8% FIXED ESCROW</span>
            </div>
            <div className="fee-row">
              <span>Unit Price ({quantity} pcs × {money(unitPrice)})</span>
              <span>{money(totalCentavos)}</span>
            </div>
            <div className="fee-row">
              <span>Platform Service & Escrow Fee (8%)</span>
              <span style={{ color: 'var(--green)' }}>+{money(platformFeeCentavos)}</span>
            </div>
            <div className="fee-row">
              <span>Seller Net Payout</span>
              <span>{money(sellerPayoutCentavos)}</span>
            </div>
            <div className="fee-row total-row">
              <span>Total Order GMV</span>
              <strong>{money(totalCentavos)}</strong>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 16px' }}>
            Protected by Silicon Trading. 72-hour dispute window commences upon delivery receipt. Arrange courier shipment directly with seller.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="button outline" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !l.isActive || l.quantity < l.minimumQuantity || address.trim().length < 15}
              className="button dark"
              style={{ flex: 2 }}
            >
              {busy ? 'Securing reservation…' : `Confirm Reservation (${money(totalCentavos)}) ↗`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailContent({
  listing: l,
  user,
  onListingReload,
}: {
  listing: Listing;
  user: User | null;
  onListingReload: () => void;
}) {
  const router = useRouter();
  const [macroOpen, setMacroOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {macroOpen && (
        <MacroModal
          src={l.art || '/images/listings/listing_iphone_board_clean.jpg'}
          title={`${l.title} — Macro Solder & Trace View`}
          onClose={() => setMacroOpen(false)}
        />
      )}

      {modalOpen && (
        <ReservationModal
          listing={l}
          onClose={() => setModalOpen(false)}
          onSuccess={orderId => router.push(`/orders/${orderId}`)}
          onReloadListing={onListingReload}
        />
      )}

      {/* Mandatory Diagnostic Claims Notice */}
      <div className="diagnostic-banner" role="alert">
        <div className="diagnostic-banner-icon">
          <ShieldAlert size={22} />
        </div>
        <div className="diagnostic-banner-content">
          <span className="diagnostic-banner-badge">HARDWARE INTEGRITY ADVISORY</span>
          <h4>Diagnostic claims are seller-supplied. Confirm pad integrity and revision match.</h4>
          <p>
            All diagnostic test points, power supply current draws, and IC descriptions are provided directly by the seller technician. Always verify solder pad integrity, ground rail resistance, and exact board revision match under your bench microscope before micro-soldering or applying power.
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="detail-art" style={{ position: 'relative' }}>
            <Art art={l.art} alt={l.title} />
            <button
              type="button"
              className="button outline small"
              style={{
                position: 'absolute',
                bottom: '14px',
                right: '14px',
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
              }}
              onClick={() => setMacroOpen(true)}
            >
              <ZoomIn size={14} /> Inspect Macro Pads
            </button>
          </div>
          <p className="sample-note">High-resolution bench photograph · Read the seller’s condition notes.</p>

          <section className="panel specs-panel">
            <h3>Micro-Soldering & Scrap Board Specification</h3>
            <div className="specs-grid">
              <div>
                <dt>Board Scrap Class</dt>
                <dd>
                  <strong>{l.boardClass || 'Grade A (Complete / All ICs)'}</strong>
                  <span className="spec-desc">
                    {l.boardClass?.includes('Grade B')
                      ? 'Partial ICs harvested; key traces and secondary chips intact.'
                      : l.boardClass?.includes('Grade C')
                      ? 'Depopulated / gold recovery e-waste refining board.'
                      : 'Intact logic board with all primary ICs (CPU, PMIC, Baseband, NAND).'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Storage Architecture (ROM)</dt>
                <dd>
                  <strong>{l.storageGb || '128GB'} Flash Storage</strong>
                  <span className="spec-desc">
                    {['4GB', '8GB'].includes(l.storageGb || '')
                      ? 'Legacy Keypad / Feature Scrap Tier'
                      : ['16GB', '32GB'].includes(l.storageGb || '')
                      ? 'Budget Android / Legacy iPhone eMMC Tier'
                      : l.storageGb === '64GB'
                      ? 'Mainstream Mid-Range eMCP Workhorse'
                      : l.storageGb === '128GB'
                      ? 'High-Demand Refurbisher Standard UFS Tier'
                      : l.storageGb === '256GB'
                      ? 'Premium Flagship Grade UFS 3.1 / NVMe'
                      : 'Elite Tier: High Salvage NAND Expansion Grade'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>System Memory (RAM)</dt>
                <dd>
                  <strong>{l.ramGb || '6GB'} LPDDR</strong>
                  <span className="spec-desc">On-package or stacked eMCP/PoP memory</span>
                </dd>
              </div>
              {l.icCode && (
                <div>
                  <dt>Laser-Etched IC Code</dt>
                  <dd>
                    <code>{l.icCode}</code>
                    <span className="spec-desc">Cross-referenced with Mobile IC Checker database</span>
                  </dd>
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <h3>Diagnostic notes</h3>
            <p className="preserve">{l.diagnostics}</p>
            <h3>About this component</h3>
            <p className="preserve">{l.description}</p>
          </section>
        </div>

        <section className="detail-info">
          <span className="eyebrow">{l.brand} / {l.category}</span>
          <h1>{l.title}</h1>
          <p>{l.model} · {l.condition}</p>
          <div className="detail-price">
            {money(l.priceCentavos)} <small>/ unit</small>
          </div>
          <p className="stock">
            {l.quantity} available · Minimum {l.minimumQuantity} per order
          </p>

          <div className="seller-box">
            <ShieldCheck />
            <div>
              <strong>{l.seller.name} {l.seller.sellerVerified && '· Verified seller'}</strong>
              <p>{l.seller.location}</p>
            </div>
          </div>

          {!user ? (
            <div className="panel" style={{ marginTop: '24px' }}>
              <Link className="button dark full" href={`/login?part=${l.id}`}>
                Log in to reserve ↗
              </Link>
              <p className="muted" style={{ margin: '12px 0 0', fontSize: '13px' }}>
                A buyer account is required to reserve components.
              </p>
            </div>
          ) : user.role === 'buyer' ? (
            <div className="panel" style={{ marginTop: '24px' }}>
              <h3>Reserve Reclaimed Component</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
                Secure this component directly from the technician seller with 8% platform escrow protection.
              </p>
              <button
                type="button"
                className="button dark full"
                onClick={() => setModalOpen(true)}
                disabled={!l.isActive || l.quantity < l.minimumQuantity}
              >
                {!l.isActive
                  ? 'Listing Paused'
                  : l.quantity < l.minimumQuantity
                  ? 'Out of Stock'
                  : 'Open Reservation Modal ↗'}
              </button>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: '1.5' }}>
                Protected by Silicon Trading: 8% platform fee included in settlement.
              </div>
            </div>
          ) : (
            <div className="notice" style={{ marginTop: '24px' }}>
              {user.id === l.sellerId ? (
                <Link href={`/parts/${l.id}/edit`}>Manage this listing ↗</Link>
              ) : (
                'Reservations are available to buyer accounts.'
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ListingEditor({ id }: { id?: string }) {
  const remote = useRemote<{ listing: Listing }>(id ? `/api/market/parts/${id}` : '/api/session');
  return (
    <div className="container">
      <Heading
        title={id ? 'Refine your listing.' : 'Give good parts a second life.'}
        text="Precise models. Honest diagnostics. Graded storage & IC classes."
      />
      <Remote error={remote.error} retry={remote.reload} loading={!remote.data}>
        <EditorForm key={remote.data?.listing?.stockVersion ?? 'new'} listing={remote.data?.listing} reload={remote.reload} />
      </Remote>
    </div>
  );
}

function EditorForm({ listing: l, reload }: { listing?: Listing; reload: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isConflict, setIsConflict] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setIsConflict(false);
    setFields(undefined);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const body = {
        ...data,
        quantity: Number(data.quantity),
        minimumQuantity: Number(data.minimumQuantity),
        ...(l ? { stockVersion: l.stockVersion } : {}),
      };
      const result = await api<{ listing: Listing }>(
        l ? `/api/market/listings/${l.id}` : '/api/market/listings',
        l ? 'PUT' : 'POST',
        body
      );
      router.push(`/parts/${result.listing.id}`);
    } catch (e) {
      const err = e as RequestError;
      if (err.status === 409) {
        setIsConflict(true);
        setError('409 Conflict: This listing was updated by another session. Please reload to see latest stock version before saving.');
      } else {
        setError(err.message);
        setFields(err.fields);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-layout">
      <form className="form panel" onSubmit={submit}>
        {isConflict && (
          <div className="notice conflict" role="alert">
            <div>
              <strong>409 Conflict: Stale Listing Version</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{error}</p>
            </div>
            <button type="button" className="button outline small" onClick={reload}>
              Reload Latest Listing
            </button>
          </div>
        )}
        <Errors error={!isConflict ? error : ''} fields={fields} />

        <h2>Component details</h2>
        <Field label="Listing title" name="title" value={l?.title} maxLength={120} />
        <div className="form-row">
          <Field label="Brand" name="brand" value={l?.brand}>
            {brands.map(v => (
              <option key={v}>{v}</option>
            ))}
          </Field>
          <Field label="Exact model" name="model" value={l?.model} maxLength={100} />
        </div>
        <div className="form-row">
          <Field label="Category" name="category" value={l?.category}>
            {categories.map(v => (
              <option key={v}>{v}</option>
            ))}
          </Field>
          <Field label="Condition" name="condition" value={l?.condition}>
            {conditions.map(v => (
              <option key={v}>{v}</option>
            ))}
          </Field>
        </div>
        <div className="form-row">
          <Field label="Board Scrap Grade / Class" name="boardClass" value={l?.boardClass || 'Grade A (Complete / All ICs)'}>
            {boardClasses.map(v => (
              <option key={v}>{v}</option>
            ))}
          </Field>
          <Field label="Storage Capacity (ROM)" name="storageGb" value={l?.storageGb || '128GB'}>
            {storageTiers.map(v => (
              <option key={v}>{v}</option>
            ))}
          </Field>
        </div>
        <div className="form-row">
          <Field label="System Memory (RAM)" name="ramGb" value={l?.ramGb || '6GB'}>
            {ramTiers.map(v => (
              <option key={v}>{v}</option>
            ))}
          </Field>
          <Field
            label="Laser-Etched IC Code (from Mobile IC Checker)"
            name="icCode"
            value={l?.icCode || ''}
            maxLength={80}
            placeholder="e.g. KMQE60013M-B318 / KLUFG8R1EM"
            required={false}
          />
        </div>
        <Field label="Description" name="description" type="textarea" value={l?.description} minLength={30} maxLength={4000} />
        <Field label="Diagnostic notes" name="diagnostics" type="textarea" value={l?.diagnostics} minLength={10} maxLength={2000} />

        <h3>Price & availability</h3>
        <div className="form-row three">
          <Field
            label="Price per unit (PHP)"
            name="price"
            type="number"
            value={l ? String(l.priceCentavos / 100) : undefined}
            min={1}
            max={999999.99}
            step="0.01"
          />
          <Field label="Stock quantity" name="quantity" type="number" value={l?.quantity ?? 1} min={l ? 0 : 1} max={10000} />
          <Field label="Minimum order" name="minimumQuantity" type="number" value={l?.minimumQuantity ?? 1} min={1} max={10000} />
        </div>
        <button className="button dark" disabled={busy}>
          {busy ? 'Saving…' : l ? 'Save changes ↗' : 'Publish listing ↗'}
        </button>
      </form>

      <aside className="sell-guide">
        <span className="eyebrow">THE MAKINGS OF A GOOD LISTING</span>
        <h2>Tell the whole story.</h2>
        <p>
          Include the exact device model, ROM/RAM capacity tier, what you tested, and laser-etched IC codes if visible under your microscope. Mention locks, visible damage and prior repairs.
        </p>
        <Art art="chip" />
        <h3>Keep availability accurate.</h3>
        <p>
          Stock is reserved when a buyer places an order. Edit your listing when the rest of your inventory changes.
        </p>
        <p>Payment and shipping are arranged directly between buyer and seller.</p>
      </aside>
    </div>
  );
}

function Workspace({ user }: { user: User }) {
  const remote = useRemote<{
    orders: Order[];
    allOrders?: Order[];
    platformStats?: {
      totalGmv: number;
      totalPlatformRevenue: number;
      completedRevenue: number;
      pendingRevenue: number;
      commissionRate: number;
      orderCount: number;
    };
    sellerStats?: { grossSales: number; platformFees: number; netPayout: number };
    listings: Listing[];
    sellers: User[];
    openOrderCount: number;
  }>('/api/market/workspace');

  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [conflictMsg, setConflictMsg] = useState('');

  async function update(url: string, body: unknown, key: string) {
    setBusy(key);
    setError('');
    setConflictMsg('');
    try {
      await api(url, 'PATCH', body);
      remote.reload();
    } catch (e) {
      const err = e as RequestError;
      if (err.status === 409) {
        setConflictMsg(err.message || '409 Conflict: Stale record. Please reload before retrying.');
      } else {
        setError(err.message);
      }
    } finally {
      setBusy('');
    }
  }

  async function handleStockAdjust(l: Listing, newQty: number) {
    if (newQty < 0) return;
    setBusy(`stock-${l.id}`);
    setError('');
    setConflictMsg('');
    try {
      await api(`/api/market/listings/${l.id}/stock`, 'PATCH', {
        quantity: newQty,
        stockVersion: l.stockVersion,
      });
      remote.reload();
    } catch (e) {
      const err = e as RequestError;
      if (err.status === 409) {
        setConflictMsg(`409 Conflict: Listing #${l.id} stock changed in another session. Please reload to see updated stock.`);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy('');
    }
  }

  async function verify(seller: User) {
    setBusy(seller.id);
    setError('');
    try {
      await api(`/api/market/sellers/${seller.id}/verify`, 'POST', { verified: !seller.sellerVerified });
      remote.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="container">
      <Heading
        title={`Your workbench, ${user.name.split(' ')[0]}.`}
        text={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} workspace · Philippine circular electronics trading.`}
      >
        {user.role === 'seller' && (
          <Link className="button dark" href="/sell">
            <Plus size={16} /> List a component
          </Link>
        )}
      </Heading>

      {conflictMsg && (
        <div className="notice conflict" role="alert">
          <div>
            <strong>409 Conflict Detected</strong>
            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{conflictMsg}</p>
          </div>
          <button className="button outline small" onClick={remote.reload}>
            Reload Workbench
          </button>
        </div>
      )}

      <Errors error={error} />

      <Remote error={remote.error} retry={remote.reload} loading={!remote.data}>
        {/* Admin Platform Overview */}
        {user.role === 'admin' && (
          <section className="workspace-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">PLATFORM OWNER REVENUE & MONETIZATION</span>
                <h2>Silicon Trading Financial Performance</h2>
              </div>
              <span className="badge-rate">Active Take-Rate: {remote.data?.platformStats?.commissionRate ?? 8}%</span>
            </div>
            <div className="workspace-stats four">
              <article>
                <span>PLATFORM REVENUE</span>
                <strong className="green">{money(remote.data?.platformStats?.totalPlatformRevenue ?? 0)}</strong>
                <p>8% transaction commission</p>
              </article>
              <article>
                <span>SETTLED REVENUE</span>
                <strong>{money(remote.data?.platformStats?.completedRevenue ?? 0)}</strong>
                <p>From completed orders</p>
              </article>
              <article>
                <span>ESCROWED CUT</span>
                <strong>{money(remote.data?.platformStats?.pendingRevenue ?? 0)}</strong>
                <p>In 72h inspection / transit</p>
              </article>
              <article>
                <span>PLATFORM GMV</span>
                <strong>{money(remote.data?.platformStats?.totalGmv ?? 0)}</strong>
                <p>{remote.data?.platformStats?.orderCount ?? 0} total platform orders</p>
              </article>
            </div>
          </section>
        )}

        {user.role === 'admin' && (
          <section className="workspace-section">
            <div className="section-heading">
              <h2>Platform Transaction Ledger</h2>
              <span>{remote.data?.allOrders?.length ?? 0} orders</span>
            </div>
            {remote.data?.allOrders?.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order / Component</th>
                      <th>Buyer & Seller</th>
                      <th>Gross GMV</th>
                      <th>Platform Cut (8%)</th>
                      <th>Seller Net</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remote.data.allOrders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>#{o.id} · {o.listingSnapshot.title}</strong>
                          <div className="muted">{date(o.createdAt)} · Qty: {o.quantity}</div>
                        </td>
                        <td>
                          <div>Buyer: <strong>{o.buyer.name}</strong></div>
                          <div className="muted">Seller: {o.listing.seller.name}</div>
                        </td>
                        <td><strong>{money(o.totalCentavos)}</strong></td>
                        <td><span className="fee-cut">+{money(o.platformFeeCentavos)}</span></td>
                        <td>{money(o.sellerPayoutCentavos)}</td>
                        <td><span className={`status status-${o.status}`}>{o.status}</span></td>
                        <td>
                          <Link className="button outline small" href={`/orders/${o.id}`}>
                            Inspect order ↗
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">No platform transactions yet.</div>
            )}
          </section>
        )}

        {/* Seller Balance */}
        {user.role === 'seller' && (
          <section className="workspace-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">EARNINGS & PAYOUTS</span>
                <h2>Seller Balance</h2>
              </div>
            </div>
            <div className="workspace-stats">
              <article>
                <span>GROSS SALES</span>
                <strong>{money(remote.data?.sellerStats?.grossSales ?? 0)}</strong>
                <p>Total value of ordered stock</p>
              </article>
              <article>
                <span>PLATFORM FEES (8%)</span>
                <strong className="fee-deduct">-{money(remote.data?.sellerStats?.platformFees ?? 0)}</strong>
                <p>Escrow & platform service fee</p>
              </article>
              <article>
                <span>NET EARNINGS</span>
                <strong className="green">{money(remote.data?.sellerStats?.netPayout ?? 0)}</strong>
                <p>Net payout after 8% take-rate</p>
              </article>
            </div>
          </section>
        )}

        {/* Orders (Buyer & Seller) */}
        {user.role !== 'admin' && (
          <section className="workspace-section">
            <div className="section-heading">
              <h2>{user.role === 'seller' ? 'Customer orders' : 'Your orders'}</h2>
              <span>{remote.data?.openOrderCount ?? 0} open</span>
            </div>
            {remote.data?.orders.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order / component</th>
                      <th>Date</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      {user.role === 'seller' && (
                        <>
                          <th>Platform Fee (8%)</th>
                          <th>Net Payout</th>
                        </>
                      )}
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remote.data.orders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>#{o.id} · {o.listingSnapshot.title}</strong>
                          <div className="muted">{user.role === 'seller' ? o.buyer.name : o.listing.seller.name}</div>
                        </td>
                        <td>{date(o.createdAt)}</td>
                        <td>{o.quantity}</td>
                        <td>{money(o.totalCentavos)}</td>
                        {user.role === 'seller' && (
                          <>
                            <td className="fee-deduct">-{money(o.platformFeeCentavos)}</td>
                            <td><strong>{money(o.sellerPayoutCentavos)}</strong></td>
                          </>
                        )}
                        <td><span className={`status status-${o.status}`}>{o.status}</span></td>
                        <td>
                          <Link className="button outline small" href={`/orders/${o.id}`}>
                            View order ↗
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                <h3>A clean workbench.</h3>
                <p>Your orders will appear here when a component is reserved.</p>
                {user.role === 'buyer' && (
                  <Link className="button outline" href="/marketplace">Find components ↗</Link>
                )}
              </div>
            )}
          </section>
        )}

        {/* Seller Listing Manager with Stock Adjuster & Visibility Toggle */}
        {user.role === 'seller' && (
          <section className="workspace-section">
            <div className="section-heading">
              <h2>Your listings</h2>
              <span>{remote.data?.listings.length ?? 0} listings</span>
            </div>
            {remote.data?.listings.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Price</th>
                      <th>Stock Adjuster</th>
                      <th>Visibility</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remote.data.listings.map(l => (
                      <tr key={l.id}>
                        <td>
                          <Link href={`/parts/${l.id}`}><strong>{l.title}</strong></Link>
                          <div className="muted">{l.model} · {l.condition}</div>
                        </td>
                        <td>{money(l.priceCentavos)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="stock-adjuster">
                            <button
                              className="stock-btn"
                              disabled={busy === `stock-${l.id}` || l.quantity <= 0}
                              onClick={() => handleStockAdjust(l, l.quantity - 1)}
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span className="stock-num">{l.quantity}</span>
                            <button
                              className="stock-btn"
                              disabled={busy === `stock-${l.id}`}
                              onClick={() => handleStockAdjust(l, l.quantity + 1)}
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`status ${l.isActive ? 'status-completed' : 'status-cancelled'}`}>
                            {l.isActive ? 'Published' : 'Paused'}
                          </span>
                        </td>
                        <td>
                          <div className="action-row">
                            <Link className="button outline small" href={`/parts/${l.id}/edit`}>
                              Edit
                            </Link>
                            <button
                              disabled={Boolean(busy)}
                              className="button outline small"
                              onClick={() =>
                                update(`/api/market/listings/${l.id}/visibility`, { isActive: !l.isActive }, String(l.id))
                              }
                            >
                              {busy === String(l.id) ? 'Updating…' : l.isActive ? 'Pause' : 'Resume'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                Your first listing starts a new possibility. <Link href="/sell">List a component ↗</Link>
              </div>
            )}
          </section>
        )}

        {/* Admin Seller Verification */}
        {user.role === 'admin' && (
          <section className="workspace-section">
            <h2>Seller verification</h2>
            <p>Review seller details before changing their verification status.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Seller</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {remote.data?.sellers.map(s => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                        <div className="muted">{s.email}</div>
                      </td>
                      <td>{s.location}</td>
                      <td>
                        <span className={`status ${s.sellerVerified ? 'status-completed' : 'status-reserved'}`}>
                          {s.sellerVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="button outline small"
                          disabled={Boolean(busy)}
                          onClick={() => verify(s)}
                        >
                          {busy === s.id ? 'Updating…' : s.sellerVerified ? 'Remove verification' : 'Verify seller'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!remote.data?.sellers.length && <div className="empty">No sellers to review.</div>}
          </section>
        )}
      </Remote>
    </div>
  );
}

function OrderPage({ id, user }: { id: string; user: User }) {
  const remote = useRemote<{ order: Order }>(`/api/market/orders/${id}`);
  return (
    <div className="container" style={{ paddingTop: '16px' }}>
      <Remote error={remote.error} retry={remote.reload} loading={!remote.data}>
        {remote.data && <OrderDetail order={remote.data.order} user={user} reload={remote.reload} />}
      </Remote>
    </div>
  );
}

function DisputeCountdownTimer({ receivedAt }: { receivedAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    progressPct: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    progressPct: 100,
  });

  useEffect(() => {
    function calculate() {
      const start = new Date(receivedAt).getTime();
      const end = start + 72 * 3600 * 1000;
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true, progressPct: 0 });
        return;
      }

      const totalWindow = 72 * 3600 * 1000;
      const progressPct = Math.min(100, Math.max(0, (diff / totalWindow) * 100));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false, progressPct });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [receivedAt]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="dispute-timer-card">
      <div className="dispute-timer-header">
        <span className="dispute-timer-title">
          <Clock size={16} /> 72-HOUR INSPECTION WINDOW
        </span>
        <span className={`status ${timeLeft.isExpired ? 'status-cancelled' : 'status-inspection'}`} style={{ margin: 0 }}>
          {timeLeft.isExpired ? 'WINDOW CLOSED' : 'ACTIVE INSPECTION'}
        </span>
      </div>
      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
        Micro-soldering pad verification countdown. Test voltage rails, CPU power draw, and NAND detection.
      </p>
      {!timeLeft.isExpired ? (
        <>
          <div className="countdown-digits">
            <div className="countdown-block">
              <div className="countdown-num">{pad(timeLeft.hours)}</div>
              <div className="countdown-lbl">Hours</div>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-block">
              <div className="countdown-num">{pad(timeLeft.minutes)}</div>
              <div className="countdown-lbl">Mins</div>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-block">
              <div className="countdown-num">{pad(timeLeft.seconds)}</div>
              <div className="countdown-lbl">Secs</div>
            </div>
          </div>
          <div className="countdown-bar">
            <div className="countdown-fill" style={{ width: `${timeLeft.progressPct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
            <span>Component Received</span>
            <span>Auto-Settlement in {timeLeft.hours}h {timeLeft.minutes}m</span>
          </div>
        </>
      ) : (
        <div className="notice" style={{ margin: '10px 0 0', fontSize: '12px' }}>
          The 72-hour dispute window has ended. Board condition accepted for settlement.
        </div>
      )}
    </div>
  );
}

function OrderDetail({ order: o, user, reload }: { order: Order; user: User; reload: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showMacro, setShowMacro] = useState(false);
  const [copiedWaybill, setCopiedWaybill] = useState(false);

  const buyer = o.buyerId === user.id;
  const seller = o.listing.sellerId === user.id;

  async function action(action: string, form?: HTMLFormElement) {
    setBusy(true);
    setError('');
    try {
      await api(`/api/market/orders/${o.id}`, 'POST', {
        action,
        ...(form ? Object.fromEntries(new FormData(form)) : {}),
      });
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copyTracking(num: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedWaybill(true);
      setTimeout(() => setCopiedWaybill(false), 2000);
    }
  }

  const thumbImg =
    o.listing?.art ||
    authenticListingImages[o.listingSnapshot.title] ||
    authenticListingImages[o.listing.category] ||
    authenticListingImages['Donor boards'] ||
    '/images/listings/listing_iphone_board_clean.jpg';

  const stepOrder = ['reserved', 'shipped', 'inspection', 'completed'];
  const currentStepIdx = stepOrder.indexOf(o.status);

  const circuitSteps = [
    {
      key: 'reserved',
      num: 1,
      title: 'Escrow Locked & Stock Reserved',
      desc: `Reserved on ${date(o.createdAt)} · Qty: ${o.quantity} unit(s)`,
    },
    {
      key: 'shipped',
      num: 2,
      title: 'Courier Dispatch & Waybill Assigned',
      desc: o.courier
        ? `${o.courier} Express · Waybill: ${o.trackingNumber || 'Assigned'}`
        : 'Awaiting seller courier dispatch (LBC / J&T / Lalamove)',
    },
    {
      key: 'inspection',
      num: 3,
      title: '72-Hour Pad & Voltage Verification',
      desc: o.receivedAt
        ? `Received on ${date(o.receivedAt)} · Timer ticking`
        : 'Multimeter & pad verification window starts on delivery',
    },
    {
      key: 'completed',
      num: 4,
      title: 'Escrow Payout Settlement',
      desc: 'Seller funds released & 8% platform take rate settled',
    },
  ];

  return (
    <>
      {showMacro && (
        <MacroModal
          src={thumbImg}
          title={`Macro Inspection: #${o.id} · ${o.listingSnapshot.title}`}
          onClose={() => setShowMacro(false)}
        />
      )}

      {/* Breadcrumb Navigation */}
      <div className="breadcrumbs" style={{ paddingTop: '8px', marginBottom: '18px' }}>
        <Link href="/workspace" className="inline-link">
          <ArrowLeft size={15} /> Back to My Workspace
        </Link>
        {' '}/ <span style={{ color: 'var(--ink)' }}>Order #{o.id}</span>
      </div>

      {/* Hero Order Banner */}
      <div className="order-hero-banner">
        <div
          className="order-hero-thumb"
          onClick={() => setShowMacro(true)}
          title="Click to inspect macro photography in full-screen"
        >
          <img src={thumbImg} alt={o.listingSnapshot.title} />
          <div className="order-hero-zoom">
            <ZoomIn size={24} />
          </div>
        </div>

        <div className="order-hero-info">
          <div className="order-hero-meta">
            <span className={`status status-${o.status}`}>
              {o.status === 'inspection' ? 'Inspection (72h Live)' : o.status}
            </span>
            <span className="order-badge-pill">Order #{o.id}</span>
            <span className="order-badge-pill">{date(o.createdAt)}</span>
            <span className="order-badge-pill" style={{ color: 'var(--green)', borderColor: 'var(--green-border)' }}>
              {user.role === 'admin'
                ? 'Admin Ledger View'
                : buyer
                ? 'Buyer Portal'
                : 'Seller Fulfillment'}
            </span>
          </div>

          <h1>{o.listingSnapshot.title}</h1>

          <div className="order-hero-badges">
            <span className="order-badge-pill">Model: {o.listingSnapshot.model}</span>
            <span className="order-badge-pill">Condition: {o.listingSnapshot.condition}</span>
            {o.listingSnapshot.boardClass && (
              <span className="order-badge-pill" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
                {o.listingSnapshot.boardClass}
              </span>
            )}
            {o.listingSnapshot.storageGb && (
              <span className="order-badge-pill">ROM: {o.listingSnapshot.storageGb}</span>
            )}
            {o.listingSnapshot.ramGb && (
              <span className="order-badge-pill">RAM: {o.listingSnapshot.ramGb}</span>
            )}
            {o.listingSnapshot.icCode && (
              <span className="order-badge-pill">IC Code: {o.listingSnapshot.icCode}</span>
            )}
          </div>
        </div>
      </div>

      <Errors error={error} />

      <div className="order-layout">
        {/* Left Column: Diagnostics, Escrow Financials, Parties & Shipping */}
        <section>
          {/* Card 1: Escrow & Financial Take-Rate Ledger */}
          <div className="order-card">
            <div className="order-card-header">
              <h2>
                <ShieldCheck /> Platform Escrow & Financial Settlement
              </h2>
              <span className="badge-rate">8% Platform Take</span>
            </div>

            <div className="escrow-metric-grid">
              <div className="escrow-metric-box">
                <div className="escrow-metric-lbl">Order Total (GMV)</div>
                <div className="escrow-metric-val">{money(o.totalCentavos)}</div>
                <div className="escrow-metric-sub">Quantity: {o.quantity} unit(s)</div>
              </div>

              <div className="escrow-metric-box">
                <div className="escrow-metric-lbl">Platform Fee (8%)</div>
                <div className="escrow-metric-val green">
                  {user.role === 'admin' ? '+' : '-'}{money(o.platformFeeCentavos)}
                </div>
                <div className="escrow-metric-sub">Silicon Trading escrow fee</div>
              </div>

              <div className="escrow-metric-box">
                <div className="escrow-metric-lbl">Seller Net Payout</div>
                <div className="escrow-metric-val amber">{money(o.sellerPayoutCentavos)}</div>
                <div className="escrow-metric-sub">Settled upon buyer acceptance</div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
              Direct peer-to-peer delivery backed by Silicon Trading 8% platform escrow and protected 72-hour multimeter diagnostic window.
            </p>
          </div>

          {/* Card 2: Component Diagnostic Sheet & Pad Claims Transparency */}
          <div className="order-card">
            <div className="order-card-header">
              <h2>
                <Cpu /> Component Diagnostic Sheet & Pad Integrity
              </h2>
              <button
                className="button outline small"
                onClick={() => setShowMacro(true)}
              >
                <ZoomIn size={14} /> Full Macro Zoom
              </button>
            </div>

            {/* Mandatory Diagnostic Claims Transparency Banner */}
            <div className="diagnostic-advisory" style={{ marginBottom: '16px' }}>
              <ShieldAlert size={18} />
              <span>
                <strong>Diagnostic Transparency:</strong> Diagnostic claims are seller-supplied. Confirm pad integrity and revision match.
              </span>
            </div>

            <div className="terminal-diagnostics">
              <div className="terminal-diagnostics-header">
                <span>BENCHMARK DIAGNOSTICS & MULTIMETER NOTES</span>
                <span>GRADE: {o.listingSnapshot.boardClass || 'UNCLASSIFIED'}</span>
              </div>
              {o.listingSnapshot.diagnostics || 'No detailed diagnostics supplied by seller.'}
            </div>

            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 6px', color: 'var(--muted)' }}>
              ORIGINAL WORKBENCH DESCRIPTION
            </h4>
            <p className="preserve" style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--ink)' }}>
              {o.listingSnapshot.description}
            </p>

            <table className="order-spec-table">
              <tbody>
                <tr>
                  <td>DEVICE MODEL</td>
                  <td>{o.listingSnapshot.model}</td>
                </tr>
                <tr>
                  <td>CONDITION CLASS</td>
                  <td>{o.listingSnapshot.condition}</td>
                </tr>
                {o.listingSnapshot.boardClass && (
                  <tr>
                    <td>BOARD SCRAP GRADE</td>
                    <td>{o.listingSnapshot.boardClass}</td>
                  </tr>
                )}
                {o.listingSnapshot.storageGb && (
                  <tr>
                    <td>STORAGE TIER</td>
                    <td>{o.listingSnapshot.storageGb}</td>
                  </tr>
                )}
                {o.listingSnapshot.ramGb && (
                  <tr>
                    <td>RAM CAPACITY</td>
                    <td>{o.listingSnapshot.ramGb}</td>
                  </tr>
                )}
                {o.listingSnapshot.icCode && (
                  <tr>
                    <td>IC / CHIP CODE</td>
                    <td><code>{o.listingSnapshot.icCode}</code></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card 3: Parties & Fulfillment Delivery */}
          <div className="order-card">
            <div className="order-card-header">
              <h2>
                <Truck /> Fulfillment & Parties Involved
              </h2>
            </div>

            <div className="parties-grid">
              <div className="party-box">
                <span className="party-tag">
                  <UserCheck size={12} /> SELLER
                </span>
                <div className="party-name">{o.listing.seller.name}</div>
                <div className="party-loc">{o.listing.seller.location}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  {o.listing.seller.email}
                </div>
              </div>

              <div className="party-box">
                <span className="party-tag">
                  <UserCheck size={12} /> BUYER
                </span>
                <div className="party-name">{o.buyer.name}</div>
                <div className="party-loc">{o.buyer.location}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  {o.buyer.email}
                </div>
              </div>
            </div>

            <div className="delivery-box">
              <div className="delivery-header">
                <MapPin size={14} color="var(--green)" /> Destination Delivery Address
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500, lineHeight: '1.5' }}>
                {o.address}
              </div>

              {o.courier && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                  <div className="delivery-header">
                    <Truck size={14} color="var(--green)" /> Courier Dispatch Details
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="waybill-badge">
                      {o.courier} Express: <strong>{o.trackingNumber || 'Pending Waybill'}</strong>
                    </span>
                    {o.trackingNumber && (
                      <button
                        className="button outline small"
                        onClick={() => copyTracking(o.trackingNumber!)}
                        title="Copy tracking number"
                      >
                        {copiedWaybill ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                        {copiedWaybill ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Order Stepper, Live Countdown, Actions */}
        <aside>
          {/* Card 1: Circuit Stepper */}
          <div className="order-card">
            <div className="order-card-header">
              <h2>
                <Layers /> Circuit Progress Pipeline
              </h2>
            </div>

            <div className="circuit-stepper">
              {circuitSteps.map((s, idx) => {
                const isDisputed = o.status === 'disputed' && s.key === 'inspection';
                const isDone = currentStepIdx > idx || o.status === 'completed';
                const isCurrent = o.status === s.key;

                return (
                  <div
                    key={s.key}
                    className={`circuit-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isDisputed ? 'disputed' : ''}`}
                  >
                    <div className="circuit-step-dot">
                      {isDone ? <Check size={14} /> : isDisputed ? '!' : s.num}
                    </div>
                    <div className="circuit-step-title">
                      {isDisputed ? 'Dispute Open in Inspection' : s.title}
                    </div>
                    <div className="circuit-step-desc">{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Actions & Inspection Station */}
          <div className="order-card">
            <div className="order-card-header">
              <h2>
                <Clock /> Inspection & Workbench Actions
              </h2>
            </div>

            {/* Live Dispute Countdown Timer if in inspection */}
            {o.receivedAt && (
              <div style={{ marginBottom: '20px' }}>
                <DisputeCountdownTimer receivedAt={o.receivedAt} />
              </div>
            )}

            {/* Seller Dispatch Submission */}
            {seller && o.status === 'reserved' && (
              <form
                className="form"
                onSubmit={e => {
                  e.preventDefault();
                  action('ship', e.currentTarget);
                }}
              >
                <h4 style={{ fontSize: '14px', margin: '0 0 12px' }}>Book Courier Dispatch</h4>
                <Field label="Courier Partner" name="courier">
                  {['LBC', 'J&T', 'Lalamove'].map(c => (
                    <option key={c} value={c}>{c} Express</option>
                  ))}
                </Field>
                <Field
                  label="Waybill / Tracking Number"
                  name="trackingNumber"
                  maxLength={100}
                  placeholder="e.g. 1792-8829-4910"
                />
                <button disabled={busy} className="button dark full">
                  <Truck size={16} /> {busy ? 'Saving…' : 'Mark Shipped & Provide Tracking'}
                </button>
              </form>
            )}

            {/* Buyer Receive Action */}
            {buyer && o.status === 'shipped' && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px' }}>
                  Has the courier delivered your parcel? Confirm receipt to activate your 72-hour multimeter and pad inspection window.
                </p>
                <button disabled={busy} className="button dark full" onClick={() => action('receive')}>
                  <CheckCircle2 size={16} /> {busy ? 'Activating…' : 'Confirm Received — Begin 72h Inspection'}
                </button>
              </div>
            )}

            {/* Buyer Inspection & Dispute Actions */}
            {buyer && o.status === 'inspection' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <button disabled={busy} className="button dark full" onClick={() => action('complete')}>
                  <CheckCircle2 size={16} /> {busy ? 'Settling…' : 'Accept Component & Release Escrow'}
                </button>

                {o.receivedAt && Date.now() > new Date(o.receivedAt).getTime() + 72 * 3600000 ? (
                  <p className="notice">The 72-hour dispute window has ended.</p>
                ) : (
                  <form
                    className="form dispute-form"
                    onSubmit={e => {
                      e.preventDefault();
                      action('dispute', e.currentTarget);
                    }}
                  >
                    <Field
                      label="Report Diagnostic / Pad Issue"
                      name="dispute"
                      type="textarea"
                      minLength={20}
                      maxLength={3000}
                      placeholder="Describe multimeter resistance readings, lifted solder pads, or mismatched board revisions..."
                    />
                    <button disabled={busy} className="button outline full" style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }}>
                      <AlertTriangle size={15} /> Raise Technical Dispute
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Dispute Display & Resolution */}
            {o.dispute && (
              <div className="notice conflict" style={{ marginTop: '16px' }}>
                <div>
                  <strong>Open Dispute Filed:</strong>
                  <div style={{ marginTop: '4px', fontStyle: 'italic' }}>"{o.dispute}"</div>
                </div>
              </div>
            )}

            {(user.role === 'admin' || seller) && o.status === 'disputed' && (
              <button
                disabled={busy}
                className="button dark full"
                style={{ marginTop: '12px' }}
                onClick={() => action('resolve_dispute')}
              >
                <CheckCircle2 size={16} /> {busy ? 'Resolving…' : 'Resolve Dispute & Complete Payout'}
              </button>
            )}

            {/* Cancel Reservation */}
            {(buyer || seller) && o.status === 'reserved' && (
              <button
                disabled={busy}
                className="button outline full"
                style={{ marginTop: '12px', color: 'var(--red)', borderColor: 'var(--red-border)' }}
                onClick={() => action('cancel')}
              >
                Cancel Reservation
              </button>
            )}

            {['completed', 'cancelled'].includes(o.status) && (
              <div className={`notice ${o.status === 'completed' ? 'success' : 'error'}`} style={{ marginTop: '14px' }}>
                {o.status === 'completed'
                  ? '✓ Component accepted. Escrow released to seller.'
                  : '✕ Reservation was cancelled. Stock returned to inventory.'}
              </div>
            )}
          </div>

          {/* Card 3: Quick Navigation */}
          <div className="order-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link className="button outline full" href="/workspace">
              <ArrowLeft size={16} /> Return to Workspace
            </Link>
            <Link className="button outline full" href={`/parts/${o.listingId}`}>
              <ExternalLink size={16} /> View Listing in Marketplace
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

function About({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`container section ${compact ? '' : 'about-page'}`}>
      {!compact && (
        <Heading
          title="One part. A new possibility."
          text="A simpler way to source reclaimed smartphone components."
        />
      )}
      <div className="section-heading">
        <div>
          <span className="eyebrow">A SIMPLER WAY TO SOURCE</span>
          <h2>From one workbench to another.</h2>
        </div>
        {compact && <Link href="/how-it-works">How it works ↗</Link>}
      </div>
      <div className="steps">
        {[
          [
            'DISCOVER',
            'Find the right fit.',
            'Search by device, brand or component. Check the exact model, condition and seller’s diagnostic notes.',
          ],
          [
            'CONNECT',
            'Reserve your component.',
            'Create a buyer account, confirm your quantity and delivery details. Protected by 8% platform escrow.',
          ],
          [
            'RESTORE',
            'Put potential to work.',
            'Follow shipment details, confirm receipt and inspect your part with 72-hour dispute window. Accept or raise an issue from your private order.',
          ],
        ].map(([label, title, text], i) => (
          <article key={label}>
            <span>0{i + 1} / {label}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      {!compact && (
        <>
          <div className="story-banner">
            <div className="story-symbol"><Recycle /></div>
            <div>
              <span className="eyebrow">LESS WASTE. MORE POSSIBILITY.</span>
              <h2>Built for the people<br />who keep tech alive.</h2>
              <p>
                Technicians, refurbishers and component sellers can connect around clear, model-specific listings.
              </p>
              <Link className="button dark" href="/marketplace">Explore components ↗</Link>
            </div>
          </div>
          <div className="panel section">
            <h3>A clear understanding.</h3>
            <p>
              Silicon Trading is a high-tech Philippine circular electronics marketplace. Verification is a seller status managed by administrators; diagnostic claims are seller-supplied. Always confirm pad integrity and revision match.
            </p>
          </div>
        </>
      )}
    </section>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('silicon-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
    document.documentElement.style.backgroundColor = next === 'light' ? '#f8faf8' : '#080f0e';
  }

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle Cyber Dark / Industrial Light theme"
      title={`Current theme: ${theme}. Click to switch.`}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function MarketApp() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [logoutBusy, setLogoutBusy] = useState(false);

  async function session() {
    setSessionError('');
    try {
      const result = await api<{ user: User | null }>('/api/session');
      setUser(result.user);
      setReady(true);
    } catch (e) {
      setSessionError((e as Error).message);
    }
  }

  useEffect(() => {
    session();
  }, []);

  async function logout() {
    setLogoutBusy(true);
    try {
      await api('/api/account/logout', 'POST', {});
      setUser(null);
      window.location.assign('/');
    } catch (e) {
      setSessionError((e as Error).message);
    } finally {
      setLogoutBusy(false);
    }
  }

  let content: ReactNode;
  const part = pathname.match(/^\/parts\/(\d+)(\/edit)?$/);
  const order = pathname.match(/^\/orders\/(\d+)$/);
  const isBulk = pathname === '/marketplace' && searchParams.get('category') === 'Bulk lots';
  const isMarketplace = (pathname === '/marketplace' && !isBulk) || Boolean(part);
  const isHowItWorks = pathname === '/how-it-works';

  if (pathname === '/') content = <Home user={user} />;
  else if (pathname === '/marketplace') content = <Catalog />;
  else if (pathname === '/how-it-works') content = <About />;
  else if (pathname === '/login' || pathname === '/register') {
    content = <Auth key={pathname} register={pathname === '/register'} onAuth={setUser} />;
  } else if (part && !part[2]) {
    content = <Detail id={part[1]} user={user} />;
  } else if (pathname === '/workspace' || pathname === '/sell' || part?.[2] || order) {
    content = !ready ? (
      <div className="container empty" role="status">Checking your session…</div>
    ) : (
      <Gate user={user} role={pathname === '/sell' || part?.[2] ? 'seller' : undefined}>
        {user &&
          (pathname === '/workspace' ? (
            <Workspace user={user} />
          ) : order ? (
            <OrderPage id={order[1]} user={user} />
          ) : (
            <ListingEditor id={part?.[1]} />
          ))}
      </Gate>
    );
  } else {
    content = (
      <div className="container">
        <Heading title="This page has moved on." text="Find your next possibility in the marketplace." />
        <Link href="/marketplace" className="button dark">Browse components</Link>
      </div>
    );
  }

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="header">
        <Link href="/" className="brand" aria-label="Silicon Trading home">
          <span className="brand-mark"><Cpu /></span>
          <span>SILICON<span className="brand-light">TRADING<span className="brand-dot">.</span></span></span>
        </Link>
        <nav aria-label="Main navigation">
          <Link className={isMarketplace ? 'active' : ''} href="/marketplace">Marketplace</Link>
          <Link className={isBulk ? 'active' : ''} href="/marketplace?category=Bulk+lots">Bulk Scrap Lots</Link>
          <Link className={isHowItWorks ? 'active' : ''} href="/how-it-works">How it works</Link>
        </nav>
        <div className="header-actions">
          {/* Cyber Dark / Industrial Light Theme Toggle */}
          <ThemeToggle />

          {/* User Session Pill */}
          {user ? (
            <>
              <Link href="/workspace" className="login-link">
                My workspace ({user.role.toUpperCase()})
              </Link>
              <button className="text-button" disabled={logoutBusy} onClick={logout}>
                {logoutBusy ? 'Logging out…' : 'Log out'}
              </button>
            </>
          ) : (
            <Link href="/login" className="login-link">Log in</Link>
          )}

          {(!user || user.role === 'seller') && (
            <Link className="button dark small" href="/sell">
              Sell a part <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </header>

      <main id="main">
        {sessionError && (
          <div className="container notice error" role="alert">
            Unable to check your account: {sessionError}{' '}
            <button className="button outline" onClick={session}>Retry</button>
          </div>
        )}
        {content}
      </main>

      <footer>
        <div className="container footer-main">
          <div>
            <Link className="brand footer-brand" href="/">
              SILICON TRADING<span className="brand-dot">.</span>
            </Link>
            <p>
              A second life for every circuit.<br />
              Philippine circular electronics marketplace.
            </p>
          </div>
          <div>
            <span className="eyebrow">EXPLORE</span>
            <Link href="/marketplace">Browse components</Link>
            <Link href={user ? '/workspace' : '/register'}>
              {user ? 'My workspace' : 'Join the workbench'}
            </Link>
            <Link href="/how-it-works">How it works</Link>
          </div>
          <div>
            <span className="eyebrow">THE DETAILS</span>
            <p>
              Pasig City, Metro Manila<br />
              Connecting technicians across the Philippines
            </p>
            <span className="prototype-label">Philippine Circular Tech Network</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Silicon Trading. Built for the circular economy.</span>
          <span>Less waste. More possibility. ↗</span>
        </div>
      </footer>
    </>
  );
}
