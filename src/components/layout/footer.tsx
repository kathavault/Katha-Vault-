import type { FC } from 'react';
import Link from 'next/link';
import { Github, Twitter, Facebook } from 'lucide-react'; // Example social icons

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-8 mt-16 border-t border-border/80">
      <div className="container px-4 md:px-6">
         {/* Grid layout for links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Press</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Writers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Readers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Guidelines</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contests</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Awards</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Copyright Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Write</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/write" className="text-muted-foreground hover:text-primary transition-colors">Start Writing</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Writing Resources</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Creator Portal</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Follow Us</h3>
            <div className="flex space-x-4">
               <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></Link>
               <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></Link>
               <Link href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors"><Github size={20} /></Link>
               {/* Add other social links */}
            </div>
             {/* Optional: Language Selector Placeholder */}
             {/* <div className="mt-4">
               <select className="text-sm bg-background border border-border rounded p-1">
                 <option>English</option>
                 <option>Español</option>
               </select>
             </div> */}
          </div>
        </div>

        {/* Copyright and attribution */}
        <div className="mt-8 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground">
          © {currentYear} Katha Vault. All rights reserved.
          <span className="mx-2">|</span>
          This is a fictional platform created for demonstration purposes.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
