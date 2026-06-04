import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; 

const inter = Inter({ subsets: ['latin'] });

// Sesuaikan Metadata murni untuk branding internal API Server Abang
export const metadata: Metadata = {
  title: 'Themavia API Server Gateway',
  description: 'Secure core engine and gateway routes provider for Themavia Marketplace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-[#fafafa] min-h-screen antialiased`}>
        
        {/* Murni hanya merender children (yaitu isi page.tsx status kita) tanpa beban UI luar */}
        <main className="w-full min-h-screen flex flex-col">
          {children}
        </main>
        
      </body>
    </html>
  );
}