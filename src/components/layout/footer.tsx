import type { FC } from 'react';
import Link from 'next/link';

const Footer: FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-8 mt-12">
      <div className="container px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-2">StoryVerse</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="#" className="hover:text-primary">About Us</Link></li>
            <li><Link href="#" className="hover:text-primary">Careers</Link></li>
            <li><Link href="#" className="hover:text-primary">Press</Link></li>
            <li><Link href="#" className="hover:text-primary">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Community</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="#" className="hover:text-primary">Writers</Link></li>
            <li><Link href="#" className="hover:text-primary">Readers</Link></li>
            <li><Link href="#" className="hover:text-primary">Guidelines</Link></li>
            <li><Link href="#" className="hover:text-primary">Contests</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Help</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
            <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-primary">Copyright</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Follow Us</h3>
           {/* Add social media icons/links here */}
           <p className="text-sm">Stay connected!</p>
        </div>
      </div>
      <div className="container px-4 md:px-6 mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} StoryVerse. Inspired by Wattpad.
      </div>
    </footer>
  );
};

export default Footer;
