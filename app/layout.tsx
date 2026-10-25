import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Silicon Trading — Give good tech a second life',description:'Reclaimed smartphone components for repair and reuse in the Philippines.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
