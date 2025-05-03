import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/auth-provider'; // Import AuthProvider

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
       {/* Wrap the body content with AuthProvider */}
      <body className={`antialiased flex flex-col min-h-screen bg-background`}>
         <AuthProvider>
            <Header />
            <main className="flex-grow container px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
         </AuthProvider>
      </body>
    </html>
  );
}
