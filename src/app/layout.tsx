import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/auth-provider'; // Import AuthProvider
import { ThemeProvider } from '@/components/layout/theme-provider'; // Import ThemeProvider

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
    <html lang="en" suppressHydrationWarning>      
      <body className={`antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          {/* ThemeProvider should wrap the components inside the body, not the main element directly */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-grow container px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {children}
            </main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
