import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Bookmark, Clock, Video, BarChart2, Loader2 } from 'lucide-react';
import { Contest } from '../lib/types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom'; // Assuming React Router for navigation

/**
 * Dashboard page for the Contesso Contest Tracker.
 * A personalized overview with widgets for next upcoming contest, bookmark stats,
 * and quick navigation. Designed as a sleek, SaaS-style home base distinct from
 * the detailed contest listings in Contests.tsx.
 */
export default function Dashboard() {
  const [nextContest, setNextContest] = useState<Contest | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;
        setUserId(currentUserId ?? null);

        // Fetch next upcoming contest
        const { data: contestData, error: contestError } = await supabase
          .from('contests')
          .select('*')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1)
          .single();

        if (contestError && contestError.code !== 'PGRST116') throw contestError; // Ignore "no rows" error
        setNextContest(contestData);

        if (currentUserId) {
          // Fetch bookmark count
          const { count, error: bookmarkError } = await supabase
            .from('bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUserId);

          if (bookmarkError) throw bookmarkError;
          setBookmarkCount(count || 0);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeRemaining = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();

    if (diffMs <= 0) return 'Started';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent">
          Dashboard
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Next Contest Widget */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <Clock className="h-5 w-5 mr-2 text-indigo-500" /> Next Up
              </h2>
              {nextContest ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {nextContest.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {nextContest.platform} • {new Date(nextContest.start_time).toLocaleString()}
                  </p>
                  <p className="text-indigo-500 dark:text-indigo-400 font-semibold">
                    {getTimeRemaining(nextContest.start_time)}
                  </p>
                  <Link
                    to="/contests"
                    className={cn(
                      'inline-block mt-2 px-4 py-2 text-sm font-medium text-white rounded-xl',
                      'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300'
                    )}
                  >
                    View Details
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No upcoming contests found.
                </p>
              )}
            </div>

            {/* Bookmark Stats Widget */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <Bookmark className="h-5 w-5 mr-2 text-indigo-500" /> Bookmarks
              </h2>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {bookmarkCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Contests saved
              </p>
              {userId && (
                <Link
                  to="/bookmarks"
                  className={cn(
                    'inline-block mt-4 px-4 py-2 text-sm font-medium text-white rounded-xl',
                    'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300'
                  )}
                >
                  Manage Bookmarks
                </Link>
              )}
            </div>

            {/* Quick Actions Widget */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <BarChart2 className="h-5 w-5 mr-2 text-indigo-500" /> Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/contests"
                  className={cn(
                    'block w-full py-2 px-4 text-sm font-medium text-white rounded-xl text-center',
                    'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300'
                  )}
                >
                  View All Contests
                </Link>
                <Link
                  to="/solutions"
                  className={cn(
                    'block w-full py-2 px-4 text-sm font-medium text-white rounded-xl text-center',
                    'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300'
                  )}
                >
                  Browse Solutions
                </Link>
                {userId && (
                  <Link
                    to="/bookmarks"
                    className={cn(
                      'block w-full py-2 px-4 text-sm font-medium text-white rounded-xl text-center',
                      'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300'
                    )}
                  >
                    My Bookmarks
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Solutions Placeholder */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg md:col-span-2 lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <Video className="h-5 w-5 mr-2 text-indigo-500" /> Recent Solutions
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Coming soon: Your recently watched solutions.
              </p>
              <Link
                to="/solutions"
                className={cn(
                  'inline-block mt-4 px-4 py-2 text-sm font-medium text-white rounded-xl',
                  'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300'
                )}
              >
                Explore All Solutions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}