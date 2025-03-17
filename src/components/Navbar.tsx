// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Bookmark, Video, DollarSign, Settings, Menu, X, Calendar } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';

/**
 * An enhanced, modern navigation bar for the Contesso app.
 * Features a sleek design with glassmorphism, gradient hover effects, and improved mobile UX.
 * Links to user pages and admin panel, with auth integration and scroll-based visibility.
 * Calendar link added next to Contests.
 */
const Navbar = () => {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { path: '/contests', label: 'Contests', icon: Trophy },
    { path: '/calendar', label: 'Calendar', icon: Calendar }, // Added Calendar link
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/solutions', label: 'Solutions', icon: Video },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/admin', label: 'Admin', icon: Settings, teamOnly: true },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUser(data.user ?? null);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setIsAuthModalOpen(false); // Close modal on successful sign-in
        toast.success('Signed in successfully');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      setUser(null);
    }
  };

  const isTeamMember = user?.role === 'admin';

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl',
          'border-b border-gray-200/30 dark:border-gray-700/30 shadow-md transition-all duration-300',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent tracking-tight uppercase">
                Contesso
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map(({ path, label, icon: Icon, teamOnly }) => {
                if (teamOnly && !isTeamMember) return null;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      'flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      location.pathname === path
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 shadow-lg'
                        : 'hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 hover:text-indigo-500 dark:hover:text-indigo-300'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-3">
                  <span
                    className={cn(
                      'text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[140px]',
                      'bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1 rounded-full'
                    )}
                  >
                    {user.email ? user.email.split('@')[0] : 'User'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className={cn(
                      'px-4 py-2 text-sm font-medium text-white rounded-full',
                      'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800',
                      'transition-all duration-300'
                    )}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium text-white rounded-full',
                    'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
                    'transition-all duration-300'
                  )}
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-200/40 dark:hover:bg-gray-700/40 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/30 dark:border-gray-700/30 py-4 px-4">
              <div className="flex flex-col space-y-3">
                {navItems.map(({ path, label, icon: Icon, teamOnly }) => {
                  if (teamOnly && !isTeamMember) return null;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium',
                        location.pathname === path
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400'
                          : 'hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 hover:text-indigo-500 dark:hover:text-indigo-300'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
                <div className="pt-4 flex flex-col space-y-3">
                  <ThemeToggle />
                  {user ? (
                    <>
                      <span
                        className={cn(
                          'text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[140px] mx-auto',
                          'bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1 rounded-full text-center'
                        )}
                      >
                        {user.email ? user.email.split('@')[0] : 'User'}
                      </span>
                      <button
                        onClick={handleSignOut}
                        className={cn(
                          'px-4 py-2 text-sm font-medium text-white rounded-full',
                          'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800',
                          'transition-all duration-300'
                        )}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        'px-4 py-2 text-sm font-medium text-white rounded-full',
                        'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
                        'transition-all duration-300'
                      )}
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;