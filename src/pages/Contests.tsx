import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Bookmark, CheckCircle, Loader2, Clock, History } from 'lucide-react';
import { Contest } from '../lib/types';
import { cn } from '../lib/utils';

/**
 * Contests page for the Contesso Contest Tracker.
 * Features a tabbed layout for Upcoming, Past, and My Contests, with platform filtering,
 * real-time countdowns, solution links for past contests, and bookmarking.
 */
export default function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'Codeforces',
    'CodeChef',
    'LeetCode',
  ]);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'my'>('upcoming');

  const platforms = ['Codeforces', 'CodeChef', 'LeetCode'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;
        setUserId(currentUserId ?? null);

        const { data: contestData, error: contestError } = await supabase
          .from('contests')
          .select('*')
          .order('start_time', { ascending: true });

        if (contestError) throw contestError;
        setContests(contestData || []);

        if (currentUserId) {
          const { data: bookmarkData, error: bookmarkError } = await supabase
            .from('bookmarks')
            .select('contest_id')
            .eq('user_id', currentUserId);

          if (bookmarkError) throw bookmarkError;
          setBookmarkedIds(new Set(bookmarkData?.map((b) => b.contest_id) || []));
        }
      } catch (error) {
        toast.error('Failed to load contests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const toggleBookmark = async (contestId: string) => {
    if (!userId) {
      toast.error('Please sign in to bookmark contests');
      return;
    }

    const isBookmarked = bookmarkedIds.has(contestId);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('contest_id', contestId);
        if (error) throw error;
        setBookmarkedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(contestId);
          return newSet;
        });
        toast.success('Removed from bookmarks');
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: userId, contest_id: contestId });
        if (error) throw error;
        setBookmarkedIds((prev) => new Set(prev).add(contestId));
        toast.success('Added to bookmarks');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

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

  const filteredContests = contests.filter((contest) => {
    const now = new Date();
    const isUpcoming = new Date(contest.start_time) > now;
    const isPast = new Date(contest.end_time) < now;
    const isMine = bookmarkedIds.has(contest.id);

    return (
      selectedPlatforms.includes(contest.platform) &&
      (activeTab === 'upcoming' ? isUpcoming : activeTab === 'past' ? isPast : isMine)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent">
          Contests
        </h1>

        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-300',
              activeTab === 'upcoming'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'
            )}
          >
            <Clock className="h-5 w-5" />
            <span>Upcoming</span>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-300',
              activeTab === 'past'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'
            )}
          >
            <History className="h-5 w-5" /> {/* Fixed: Use History here */}
            <span>Past</span>
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-300',
              activeTab === 'my'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'
            )}
          >
            <Bookmark className="h-5 w-5" />
            <span>My Contests</span>
          </button>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Filter Platforms
          </h2>
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                  selectedPlatforms.includes(platform)
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/70'
                )}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            {activeTab === 'upcoming'
              ? 'Upcoming Contests'
              : activeTab === 'past'
              ? 'Past Contests'
              : 'My Contests'}
            <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredContests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No contests match your filters.
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredContests.map((contest) => (
                <li
                  key={contest.id}
                  className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl shadow-sm transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {contest.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contest.platform} • {new Date(contest.start_time).toLocaleString()} -{' '}
                        {new Date(contest.end_time).toLocaleString()}
                      </p>
                      {activeTab === 'past' && contest.solution_link ? (
                        <a
                          href={contest.solution_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                        >
                          Watch Solution
                        </a>
                      ) : activeTab === 'past' ? (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No solution available
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center space-x-4">
                      {activeTab === 'upcoming' && (
                        <span className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm">
                          {getTimeRemaining(contest.start_time)}
                        </span>
                      )}
                      <button
                        onClick={() => toggleBookmark(contest.id)}
                        className={cn(
                          'p-2 rounded-full transition-all duration-300',
                          bookmarkedIds.has(contest.id)
                            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/40 dark:hover:bg-gray-700/40'
                        )}
                      >
                        <Bookmark
                          className={cn(
                            'h-5 w-5',
                            bookmarkedIds.has(contest.id) && 'fill-current'
                          )}
                        />
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