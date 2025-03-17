// src/pages/Contests.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2, Bookmark, Clock, Video, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Contest } from '../lib/types'; // Assuming Contest type exists

/**
 * Contests page for Contesso Contest Tracker.
 * Fetches upcoming and past contests from Codeforces, CodeChef, and LeetCode,
 * with filtering, bookmarking, and YouTube solution links.
 */
export default function Contests() {
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [pastContests, setPastContests] = useState<Contest[]>([]);
  const [bookmarkedContests, setBookmarkedContests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    codeforces: true,
    codechef: true,
    leetcode: true,
  });
  const [solutionLinks, setSolutionLinks] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;
        setUserId(currentUserId ?? null);

        // Fetch contests from Kontests API
        const [codeforcesRes, codechefRes, leetcodeRes] = await Promise.all([
          fetch('https://kontests.net/api/v1/codeforces'),
          fetch('https://kontests.net/api/v1/code_chef'),
          fetch('https://kontests.net/api/v1/leet_code'),
        ]);
        const codeforces = await codeforcesRes.json();
        const codechef = await codechefRes.json();
        const leetcode = await leetcodeRes.json();

        // Normalize contest data
        const normalizeContest = (contest: any, platform: string): Contest => ({
          id: `${platform}-${contest.name}-${contest.start_time}`,
          name: contest.name,
          platform: platform as 'Codeforces' | 'CodeChef' | 'LeetCode',
          start_time: contest.start_time,
          end_time: contest.end_time || new Date(new Date(contest.start_time).getTime() + contest.duration * 1000).toISOString(),
          duration: contest.duration / 3600, // Convert seconds to hours
          url: contest.url,
          solution_link: null,
        });

        const allContests = [
          ...codeforces.map((c: any) => normalizeContest(c, 'Codeforces')),
          ...codechef.map((c: any) => normalizeContest(c, 'CodeChef')),
          ...leetcode.map((c: any) => normalizeContest(c, 'LeetCode')),
        ];

        const now = new Date();
        setUpcomingContests(allContests.filter((c) => new Date(c.start_time) > now));
        setPastContests(allContests.filter((c) => new Date(c.end_time) <= now));

        // Fetch bookmarks
        if (currentUserId) {
          const { data: bookmarks } = await supabase
            .from('bookmarks')
            .select('contest_id')
            .eq('user_id', currentUserId);
          setBookmarkedContests(bookmarks?.map((b: any) => b.contest_id) || []);
        }

        // Fetch solution links from Supabase
        const { data: solutions } = await supabase.from('contest_solutions').select('contest_id, solution_link');
        const solutionMap = solutions?.reduce((acc: any, curr: any) => {
          acc[curr.contest_id] = curr.solution_link;
          return acc;
        }, {});
        setSolutionLinks(solutionMap || {});
      } catch (error) {
        toast.error('Failed to load contests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleBookmark = async (contestId: string) => {
    if (!userId) {
      toast.error('Please sign in to bookmark contests');
      return;
    }

    const isBookmarked = bookmarkedContests.includes(contestId);
    try {
      if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', userId).eq('contest_id', contestId);
        setBookmarkedContests((prev) => prev.filter((id) => id !== contestId));
        toast.success('Bookmark removed');
      } else {
        await supabase.from('bookmarks').insert({ user_id: userId, contest_id: contestId });
        setBookmarkedContests((prev) => [...prev, contestId]);
        toast.success('Contest bookmarked');
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

  const filteredUpcoming = upcomingContests.filter((c) =>
    (filters.codeforces && c.platform === 'Codeforces') ||
    (filters.codechef && c.platform === 'CodeChef') ||
    (filters.leetcode && c.platform === 'LeetCode')
  );
  const filteredPast = pastContests.filter((c) =>
    (filters.codeforces && c.platform === 'Codeforces') ||
    (filters.codechef && c.platform === 'CodeChef') ||
    (filters.leetcode && c.platform === 'LeetCode')
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent">
          Contests
        </h1>

        {/* Filters */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filter Platforms</h2>
          <div className="flex space-x-6">
            {['codeforces', 'codechef', 'leetcode'].map((platform) => (
              <label key={platform} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters[platform as keyof typeof filters]}
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      [platform]: !prev[platform as keyof typeof filters],
                    }))
                  }
                  className="h-5 w-5 text-indigo-600"
                />
                <span className="text-gray-700 dark:text-gray-300 capitalize">{platform}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Contests</h2>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredUpcoming.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming contests found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredUpcoming.map((contest) => (
                <li
                  key={contest.id}
                  className={cn(
                    'p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl shadow-sm transition-all duration-300',
                    'hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{contest.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contest.platform} • {new Date(contest.start_time).toLocaleString()}
                      </p>
                      <p className="text-indigo-500 dark:text-indigo-400 font-semibold flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> {getTimeRemaining(contest.start_time)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a
                        href={contest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                      >
                        Visit Contest
                      </a>
                      <button
                        onClick={() => toggleBookmark(contest.id)}
                        className={cn(
                          'p-2 rounded-full transition-all duration-300',
                          bookmarkedContests.includes(contest.id)
                            ? 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900'
                            : 'text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-gray-200/40 dark:hover:bg-gray-700/40'
                        )}
                      >
                        <Bookmark className="h-5 w-5" fill={bookmarkedContests.includes(contest.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Past Contests */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Past Contests</h2>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredPast.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No past contests found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredPast.map((contest) => (
                <li
                  key={contest.id}
                  className={cn(
                    'p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl shadow-sm transition-all duration-300',
                    'hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{contest.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contest.platform} • Ended {new Date(contest.end_time).toLocaleString()}
                      </p>
                      {solutionLinks[contest.id] && (
                        <a
                          href={solutionLinks[contest.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm flex items-center"
                        >
                          <Video className="h-4 w-4 mr-1" /> Watch Solution
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Ended
                      </span>
                      <button
                        onClick={() => toggleBookmark(contest.id)}
                        className={cn(
                          'p-2 rounded-full transition-all duration-300',
                          bookmarkedContests.includes(contest.id)
                            ? 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900'
                            : 'text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-gray-200/40 dark:hover:bg-gray-700/40'
                        )}
                      >
                        <Bookmark className="h-5 w-5" fill={bookmarkedContests.includes(contest.id) ? 'currentColor' : 'none'} />
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