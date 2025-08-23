import React, { useState, useEffect } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Send, Briefcase, Home, Info } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import Logo from './Logo';
    import ThemeToggleButton from './ThemeToggleButton';
    import { AuthButtonsDesktop } from './AuthButtons';
    import { DesktopNavigation } from './Navigation';
    import MobileMenuSheet from './MobileMenuSheet';

    const navLinks = [
      { name: 'Home', path: '/', icon: Home },
      { name: 'Yank a Bag Now', path: '/yank-a-bag-now', icon: Briefcase },
      { name: 'Send a Bag', path: '/send-a-bag', icon: Send },
      { name: 'Support', path: '/support', icon: Info },
    ];
    
    const Header = ({ session }) => {
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
      const location = useLocation(); 
      const navigate = useNavigate();
      const { toast } = useToast();

      useEffect(() => {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }, [isDarkMode]);

      const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
      };

      const closeMobileMenu = () => setIsMobileMenuOpen(false);
      
      // Supabase is NOT authenticated, so no supabase client can be used
      const handleSignOut = async () => {
        closeMobileMenu();
        toast({
          title: 'Authentication Incomplete',
          description: 'Please complete the Supabase integration steps to enable sign-out functionality.',
          variant: 'destructive',
        });
      };

      return (
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="sticky top-0 z-50 bg-primary dark:bg-blue-700 backdrop-blur-md shadow-lg"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-24 md:h-28">
              <div className="flex items-center">
                <Logo onClick={closeMobileMenu} />
              </div>
              <DesktopNavigation links={navLinks} />

              <div className="hidden md:flex items-center space-x-3">
                <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                <AuthButtonsDesktop session={session} handleSignOut={handleSignOut} />
              </div>

              <div className="md:hidden flex items-center">
                <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                <MobileMenuSheet 
                    isOpen={isMobileMenuOpen} 
                    onOpenChange={setIsMobileMenuOpen}
                    links={navLinks}
                    session={session}
                    handleSignOut={handleSignOut}
                    closeMobileMenu={closeMobileMenu}
                />
              </div>
            </div>
          </div>
          <AnimatePresence>
            {location.pathname !== "/" && ( 
              <motion.div
                layoutId="activeLinkIndicator" 
                className="h-0.5 bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 dark:from-sky-400 dark:via-cyan-400 dark:to-teal-400"
                initial={false} 
                animate={{
                  width: navLinks.some(link => link.path === location.pathname && link.path !== "/") ? '100%' : '0%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </AnimatePresence>
        </motion.header>
      );
    };

    export default Header;