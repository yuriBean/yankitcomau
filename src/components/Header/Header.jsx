import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Briefcase, Send, Plane, LifeBuoy } from 'lucide-react';

import Logo from './Logo';
import { DesktopNavigation } from './Navigation'; 
import AuthButtons from './AuthButtons';
import ThemeToggleButton from './ThemeToggleButton';
import MobileMenuSheet from './MobileMenuSheet';

const navLinks = [
  { path: '/', name: 'Home', icon: Home },
  // { path: '/flights-search', name: 'Flights', icon: Plane },
  { path: '/yank-a-bag-now', name: 'Yank a Bag', icon: Briefcase },
  { path: '/send-a-bag', name: 'Send a Bag', icon: Send },
  { path: '/support', name: 'Support', icon: LifeBuoy },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 dark:from-slate-900 dark:via-blue-900 dark:to-black shadow-md text-white">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Logo />
          </Link>
          <DesktopNavigation links={navLinks} />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <AuthButtons />
            <ThemeToggleButton />
          </div>
          <div className="md:hidden">
            <MobileMenuSheet 
              isOpen={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
              links={navLinks}
              closeMobileMenu={closeMobileMenu}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;