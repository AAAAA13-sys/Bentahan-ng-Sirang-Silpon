import { Suspense } from 'react';
import MarketApp from '../../components/market-app';
export default function Page(){return <Suspense fallback={<p className="container">Opening the workbench…</p>}><MarketApp/></Suspense>}
