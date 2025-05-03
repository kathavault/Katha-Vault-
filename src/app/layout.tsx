import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean default font
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StoryVerse - Read & Write Stories',
  description: 'Discover and share original stories on StoryVerse. Inspired by Wattpad.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container px-4 md:px-6 py-8">
          {children}
        </main>
        <Footer />
        <Toaster /> {/* Add Toaster for notifications */}
      </body>
    </html>
  );
}
