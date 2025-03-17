import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2, Trash2, Bookmark } from 'lucide-react';
import { Contest } from '../lib/types';
import { cn } from '../lib/utils';

/**
 * Bookmarks page for the Contesso Contest Tracker.
 * Displays user-bookmarked contests with options to remove bookmarks.
 * Modern SaaS UI with real-time updates and responsive design.
 */
export default function Bookmarks() {
  const [bookmarkedContests, setBookmarkedContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;
        setUserId(currentUserId ?? null);

        if (!currentUserId) {
          toast.error('Please sign in to view bookmarks');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('bookmarks')
          .select('contest:contests(*)')
          .eq('user_id', currentUserId);

        if (error) throw error;

        // Safely type the response using 'unknown' first
        const typedData = data as unknown as { contest: Contest }[];
        const contests: Contest[] = typedData.map((item) => item.contest);
        setBookmarkedContests(contests);
      } catch (error) {
        toast.error('Failed to load bookmarks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const removeBookmark = async (contestId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('contest_id', contestId);

      if (error) throw error;
      setBookmarkedContests((prev) => prev.filter((c) => c.id !== contestId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  const getTimeStatus = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();

    if (diffMs > 0) {
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `Starts in ${days}d ${hours}h`;
    }
    return 'Ended';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent">
          Bookmarks
        </h1>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : !userId ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Sign in to view your bookmarked contests.
            </p>
          ) : bookmarkedContests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No bookmarked contests yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {bookmarkedContests.map((contest) => (
                <li
                  key={contest.id}
                  className={cn(
                    'p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl shadow-sm transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Bookmark className="h-5 w-5 text-indigo-500 mr-2 fill-current" />
                        {contest.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contest.platform} • {new Date(contest.start_time).toLocaleString()}
                      </p>
                      {contest.solution_link && (
                        <a
                          href={contest.solution_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                        >
                          Watch Solution
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm">
                        {getTimeStatus(contest.start_time)}
                      </span>
                      <button
                        onClick={() => removeBookmark(contest.id)}
                        className={cn(
                          'p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-500/10 transition-all duration-300'
                        )}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}