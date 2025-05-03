// src/app/admin/layout.tsx
import type { Metadata } from 'next';
import '../globals.css'; // Use the main global styles
import Header from '@/components/layout/header'; // Can use the same header or a different one
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/auth-provider'; // Import AuthProvider

export const metadata: Metadata = {
  title: 'Katha Vault - Admin',
  description: 'Katha Vault Administration Panel',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en">
       {/* Wrap the body content with AuthProvider */}
       <body className={`antialiased flex flex-col min-h-screen bg-secondary/50`}>
         <AuthProvider>
             <Header /> {/* Use the main header for now */}
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
