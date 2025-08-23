import React from 'react';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { SheetClose } from '@/components/ui/sheet';
    import { LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

    export const AuthButtonsDesktop = ({ session, handleSignOut }) => (
      <>
        {session ? (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" asChild className="border-white/50 text-white hover:bg-white/20 dark:border-sky-300/50 dark:text-sky-200 dark:hover:bg-sky-400/30">
                <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" onClick={handleSignOut} className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20 dark:text-sky-200 dark:hover:bg-sky-400/30">
                <Link to="/signin"><LogIn className="mr-2 h-4 w-4" /> Sign In</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" asChild className="bg-gradient-to-r from-sky-400 to-cyan-400 hover:opacity-90 text-primary-foreground dark:from-sky-500 dark:to-cyan-500">
                <Link to="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
              </Button>
            </motion.div>
          </>
        )}
      </>
    );
    AuthButtonsDesktop.displayName = 'AuthButtonsDesktop';
    
    export const AuthButtonsMobile = ({ session, handleSignOut }) => (
       <>
        {session ? (
          <>
            <SheetClose asChild>
              <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 dark:border-blue-400/50 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:hover:text-blue-200" asChild>
                <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button onClick={handleSignOut} className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 text-white">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </SheetClose>
          </>
        ) : (
          <>
            <SheetClose asChild>
             <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 dark:border-blue-400/50 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:hover:text-blue-200" asChild>
               <Link to="/signin"><LogIn className="mr-2 h-4 w-4" /> Sign In</Link>
             </Button>
            </SheetClose>
            <SheetClose asChild>
             <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white dark:from-blue-500 dark:to-sky-600" asChild>
               <Link to="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
             </Button>
            </SheetClose>
          </>
        )}
       </>
    );
    AuthButtonsMobile.displayName = 'AuthButtonsMobile';