import type { Metadata } from 'next';
// Removed Inter font import, will rely on body style in globals.css
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// const inter = Inter({ subsets: ['latin'] }); // Removed Inter

export const metadata: Metadata = {
  title: 'Katha Vault - Read & Write Stories',
  description: 'Discover and share original stories on Katha Vault.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Removed inter.className, font is now set in globals.css */}
      <body className={`antialiased flex flex-col min-h-screen bg-background`}>
        <Header />
        {/* Slightly reduced vertical padding, increased horizontal for wider screens */}
        <main className="flex-grow container px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
        <Footer />
        <Toaster /> {/* Add Toaster for notifications */}
      </body>
    </html>
  );
}
