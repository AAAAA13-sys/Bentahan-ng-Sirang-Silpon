import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Silicon Trading — Bentahan ng Sirang Silpon | Philippine Circular Electronics Marketplace',
  description: 'Reclaimed smartphone motherboards, donor logic boards, IC chips, and OLED displays for repair and reuse in the Philippines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning style={{ colorScheme: 'dark', backgroundColor: '#080f0e' }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('silicon-theme')||'dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;document.documentElement.style.backgroundColor=t==='light'?'#f8faf8':'#080f0e';}catch(e){}})()`,
          }}
        />
      </head>
      <body style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>{children}</body>
    </html>
  );
}
