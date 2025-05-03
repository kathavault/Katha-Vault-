import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css'; // Import global styles
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

// Metadata can be dynamic based on the reading content, handled in the page component
export const metadata: Metadata = {
  title: 'StoryVerse Reader',
  description: 'Immerse yourself in the story.',
};

export default function ReadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {/* This layout intentionally omits the default Header and Footer */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
