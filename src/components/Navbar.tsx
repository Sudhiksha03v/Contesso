import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Trophy, Bookmark, Video, DollarSign, Settings, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';

/**
 * A modern, translucent navigation bar for the Contesso app.
 * Features user-facing pages: Dashboard, Contests, Bookmarks, Solutions, Pricing,
 * and a team-only Admin Panel. Hides on scroll down and shows on scroll up.
 */
const Navbar = () => {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { path: '/contests', label: 'Contests', icon: Trophy },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/solutions', label: 'Solutions', icon: Video },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/admin', label: 'Admin', icon: Settings, teamOnly: true },
  ];

  // Sync user state with Supabase auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Handle scroll behavior
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

  const isTeamMember = user?.role === 'admin'; // Adjust based on your auth setup

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/40 dark:border-gray-700/40 shadow-lg transition-transform duration-300',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Brand */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent tracking-tight uppercase">
                Contesso
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map(({ path, label, icon: Icon, teamOnly }) => {
                if (teamOnly && !isTeamMember) return null; // Hide Admin for non-team
                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      'flex items-center space-x-2 px-5 py-3 rounded-xl transition-all duration-300 text-sm font-medium group',
                      location.pathname === path
                        ? 'bg-indigo-600/30 text-indigo-600 dark:text-indigo-400 shadow-xl'
                        : 'hover:bg-gray-200/40 dark:hover:bg-gray-700/40 hover:text-indigo-500 dark:hover:text-indigo-300 hover:shadow-md'
                    )}
                  >
                    <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[160px] bg-gray-100/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                    {user.email ? user.email.split('@')[0] : 'User'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:shadow-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-3 rounded-xl hover:bg-gray-200/40 dark:hover:bg-gray-700/40 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl border-t border-gray-200/40 dark:border-gray-700/40 py-6 px-6">
              {navItems.map(({ path, label, icon: Icon, teamOnly }) => {
                if (teamOnly && !isTeamMember) return null;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-2 px-5 py-3 rounded-xl transition-all duration-300 text-sm font-medium group',
                      location.pathname === path
                        ? 'bg-indigo-600/30 text-indigo-600 dark:text-indigo-400 shadow-xl'
                        : 'hover:bg-gray-200/40 dark:hover:bg-gray-700/40 hover:text-indigo-500 dark:hover:text-indigo-300 hover:shadow-md'
                    )}
                  >
                    <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              <div className="mt-6 flex flex-col space-y-4">
                <ThemeToggle />
                {user ? (
                  <>
                    <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/60 dark:bg-gray-800/60 rounded-full text-center">
                      {user.email ? user.email.split('@')[0] : 'User'}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:shadow-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 text-sm font-medium"
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
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
                  >
                    Sign In
                  </button>
                )}
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