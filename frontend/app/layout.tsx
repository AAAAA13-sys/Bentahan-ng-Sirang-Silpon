import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Silicon Trading: The Smartphone Donor Board Pipeline | B2B Circular Silicon Manufacturing',
  description: 'The Smartphone Donor Board Pipeline. Commercializing reclaimed silicon microchips and donor logic boards for sustainable circular tech manufacturing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark', backgroundColor: '#080f0e' }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.removeItem('silicon-theme');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';document.documentElement.style.backgroundColor='#080f0e';}catch(e){}})()`,
          }}
        />
      </head>
      <body style={{ backgroundColor: '#080f0e', color: '#e6f3f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>{children}</body>
    </html>
  );
}
