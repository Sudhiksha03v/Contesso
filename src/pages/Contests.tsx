// src/pages/Contests.tsx
import { useState, useEffect } from 'react';
import { Bookmark, Clock, Filter, AlertTriangle, PlayCircle, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Contest as BaseContest } from '../lib/types';
import { format, differenceInMilliseconds } from 'date-fns';
import axios from 'axios';
import { youtube_v3 } from '@googleapis/youtube';

interface Contest extends BaseContest {
  isBookmarked?: boolean;
  solution_link: string | null; // Ensure this matches the type
  status: 'upcoming' | 'current' | 'past';
}

const youtube = new youtube_v3.Youtube({
  auth: process.env.REACT_APP_YOUTUBE_API_KEY, // From .env
});

const playlists = {
  LeetCode: 'PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr',
  Codeforces: 'PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB',
  CodeChef: 'PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr',
};

export default function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['Codeforces', 'CodeChef', 'LeetCode']));
  const [filterMode, setFilterMode] = useState<'upcoming' | 'current' | 'past' | 'all'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<string>('');
  const [solutionLink, setSolutionLink] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAndSyncContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();

      // Codeforces API
      const cfData = await fetch('https://codeforces.com/api/contest.list').then(res => res.json());
      if (cfData.status !== 'OK') throw new Error('Codeforces API failed');
      const cfContests = cfData.result.map((contest: any) => ({
        id: `cf_${contest.id}`,
        name: contest.name,
        platform: 'Codeforces' as const,
        start_time: new Date(contest.startTimeSeconds * 1000).toISOString(),
        end_time: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000).toISOString(),
        duration: Math.floor(contest.durationSeconds / 60),
        url: `https://codeforces.com/contest/${contest.id}`,
        solution_link: null,
        status: new Date(contest.startTimeSeconds * 1000) > now
          ? 'upcoming'
          : new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000) > now
          ? 'current'
          : 'past',
      }));

      // CodeChef API
      let ccContests: Contest[] = [];
      try {
        const ccData = await fetch('https://www.codechef.com/api/list/contests/all').then(res => res.json());
        ccContests = [...ccData.future_contests, ...ccData.present_contests, ...ccData.past_contests].map((contest: any) => ({
          id: `cc_${contest.contest_code}`,
          name: contest.contest_name,
          platform: 'CodeChef' as const,
          start_time: new Date(contest.contest_start_date).toISOString(),
          end_time: new Date(contest.contest_end_date).toISOString(),
          duration: Math.floor((new Date(contest.contest_end_date).getTime() - new Date(contest.contest_start_date).getTime()) / 60000),
          url: `https://www.codechef.com/${contest.contest_code}`,
          solution_link: null,
          status: new Date(contest.contest_start_date) > now
            ? 'upcoming'
            : new Date(contest.contest_end_date) > now
            ? 'current'
            : 'past',
        }));
      } catch (ccError) {
        console.warn('CodeChef API failed, skipping:', ccError);
      }

      // LeetCode API
      let lcContests: Contest[] = [];
      try {
        const lcData = await axios.get('https://cors-anywhere.herokuapp.com/https://leetcode.com/contest/api/list/', {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        }).then(res => res.data);
        lcContests = (lcData as any[]).map((contest: any) => ({
          id: `lc_${contest.titleSlug}`,
          name: contest.title,
          platform: 'LeetCode' as const,
          start_time: new Date(contest.startTime * 1000).toISOString(),
          end_time: new Date((contest.startTime + (contest.duration || 5400)) * 1000).toISOString(),
          duration: contest.duration ? Math.floor(contest.duration / 60) : 90,
          url: `https://leetcode.com/contest/${contest.titleSlug}`,
          solution_link: null,
          status: new Date(contest.startTime * 1000) > now
            ? 'upcoming'
            : new Date((contest.startTime + (contest.duration || 5400)) * 1000) > now
            ? 'current'
            : 'past',
        }));
      } catch (lcError) {
        console.warn('LeetCode API failed, skipping:', lcError);
      }

      const allContests = [...cfContests, ...ccContests, ...lcContests];
      await supabase.from('contests').upsert(allContests, { onConflict: 'id' });

      const { data: syncedContests, error: fetchError } = await supabase.from('contests').select('*');
      if (fetchError) throw fetchError;

      const { data: bookmarks } = await supabase.from('bookmarks').select('contest_id');
      const bookmarkSet = new Set(bookmarks?.map(b => b.contest_id));

      const contestsWithBookmarks = syncedContests.map(contest => {
        const contestStart = new Date(contest.start_time);
        const contestEnd = new Date(contest.end_time);
        return {
          ...contest,
          isBookmarked: bookmarkSet.has(contest.id),
          status: contestStart > now
            ? 'upcoming'
            : contestEnd > now
            ? 'current'
            : 'past',
        };
      });

      setContests(contestsWithBookmarks);
    } catch (err) {
      setError('Failed to fetch or sync contests. Displaying cached data if available.');
      console.error('Fetch/Sync error:', err);

      const now = new Date(); // Define 'now' here for the error case
      const { data: cachedContests } = await supabase.from('contests').select('*');
      if (cachedContests) {
        const { data: bookmarks } = await supabase.from('bookmarks').select('contest_id');
        const bookmarkSet = new Set(bookmarks?.map(b => b.contest_id));
        setContests(cachedContests.map(c => {
          const contestStart = new Date(c.start_time);
          const contestEnd = new Date(c.end_time);
          return {
            ...c,
            isBookmarked: bookmarkSet.has(c.id),
            status: contestStart > now
              ? 'upcoming'
              : contestEnd > now
              ? 'current'
              : 'past',
          };
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const syncYouTubeSolutions = async () => {
    if (!process.env.REACT_APP_YOUTUBE_API_KEY) {
      console.warn('YouTube API key missing, skipping sync');
      return;
    }
    try {
      for (const [platform, playlistId] of Object.entries(playlists)) {
        const response = await youtube.playlistItems.list({
          part: ['snippet'],
          playlistId,
          maxResults: 50,
        });

        const videos = response.data.items || [];
        for (const video of videos) {
          const title = video.snippet?.title || '';
          const videoId = video.snippet?.resourceId?.videoId;
          if (!videoId) continue;

          const contestName = title.split('|')[0]?.trim();
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

          const { data: contest } = await supabase
            .from('contests')
            .select('id')
            .ilike('name', `%${contestName}%`)
            .eq('platform', platform)
            .single();

          if (contest) {
            await supabase
              .from('contests')
              .update({ solution_link: videoUrl })
              .eq('id', contest.id);
            setContests(prev => prev.map(c => c.id === contest.id ? { ...c, solution_link: videoUrl } : c));
            console.log(`Synced solution for ${contestName} (${platform})`);
          }
        }
      }
    } catch (error) {
      console.error('YouTube sync error:', error);
    }
  };

  useEffect(() => {
    const filtered = contests.filter(contest => {
      if (filterMode === 'all') return selectedPlatforms.has(contest.platform);
      return selectedPlatforms.has(contest.platform) && contest.status === filterMode;
    });
    setFilteredContests(filtered);
  }, [contests, selectedPlatforms, filterMode]);

  useEffect(() => {
    const initialize = async () => {
      await fetchAndSyncContests();
      await syncYouTubeSolutions(); // Initial sync

      const { data: user } = await supabase.auth.getUser();
      setIsAdmin(user?.user?.role === 'admin');
    };
    initialize();

    const contestInterval = setInterval(fetchAndSyncContests, 60000);
    const youtubeInterval = setInterval(syncYouTubeSolutions, 24 * 60 * 60 * 1000);
    return () => {
      clearInterval(contestInterval);
      clearInterval(youtubeInterval);
    };
  }, []);

  const toggleBookmark = async (id: string) => {
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id ?? 'default_user';

    const updatedContests = contests.map(c => 
      c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c
    );
    setContests(updatedContests);

    const contest = updatedContests.find(c => c.id === id);
    if (contest?.isBookmarked) {
      await supabase.from('bookmarks').upsert({
        id: `${id}_${userId}`,
        user_id: userId,
        contest_id: id,
      }, { onConflict: 'id' });
      toast.success('Contest bookmarked!');
    } else {
      await supabase.from('bookmarks').delete().eq('contest_id', id).eq('user_id', userId);
      toast.success('Bookmark removed!');
    }
  };

  const togglePlatform = (platform: string) => {
    const newPlatforms = new Set(selectedPlatforms);
    if (newPlatforms.has(platform)) newPlatforms.delete(platform);
    else newPlatforms.add(platform);
    setSelectedPlatforms(newPlatforms);
  };

  const getTimeRemaining = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start > now) {
      const diffMs = differenceInMilliseconds(start, now);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
    }
    return end > now ? 'Ongoing' : 'Ended';
  };

  const handleAddSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContest || !solutionLink) {
      toast.error('Please select a contest and provide a solution link');
      return;
    }

    const { error } = await supabase
      .from('contests')
      .update({ solution_link: solutionLink })
      .eq('id', selectedContest);
    
    if (error) {
      toast.error('Failed to update solution link');
      console.error(error);
    } else {
      toast.success('Solution link added successfully!');
      setContests(prev => prev.map(c => c.id === selectedContest ? { ...c, solution_link: solutionLink } : c));
      setSolutionLink('');
      setSelectedContest('');
      setIsAdminModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 flex justify-between items-center">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Contest Tracker
            </h1>
            {isAdmin && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200"
              >
                <Settings className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Filter Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap items-center space-x-6 mb-4 md:mb-0">
              <Filter className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              {['Codeforces', 'CodeChef', 'LeetCode'].map(platform => (
                <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.has(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{platform}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-4">
              {['upcoming', 'current', 'past', 'all'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode as typeof filterMode)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300',
                    filterMode === mode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center mb-8 p-4 bg-red-100/80 dark:bg-red-900/80 text-red-700 dark:text-red-200 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Contest Cards */}
          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">Loading contests...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContests.map(contest => (
                <div
                  key={contest.id}
                  className="relative bg-white/95 dark:bg-gray-850/95 rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                >
                  <div
                    className={cn(
                      'absolute top-0 left-0 px-3 py-1 text-xs font-semibold text-white rounded-br-lg shadow-sm',
                      contest.platform === 'Codeforces' && 'bg-indigo-600',
                      contest.platform === 'CodeChef' && 'bg-purple-600',
                      contest.platform === 'LeetCode' && 'bg-pink-500'
                    )}
                  >
                    {contest.platform}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                      {contest.name}
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">Starts:</span>{' '}
                        {format(new Date(contest.start_time), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">Duration:</span>{' '}
                        {contest.duration} mins
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-indigo-500 animate-pulse" />
                        <span
                          className={cn(
                            'font-medium',
                            contest.status === 'current' && 'text-green-600 dark:text-green-400',
                            contest.status === 'past' && 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {getTimeRemaining(contest.start_time, contest.end_time)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-100/80 dark:bg-gray-900/80 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleBookmark(contest.id)}
                        className={cn(
                          'p-2 rounded-full transition-all duration-200',
                          contest.isBookmarked
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                          'hover:bg-indigo-200 dark:hover:bg-indigo-800'
                        )}
                      >
                        <Bookmark className="h-5 w-5" />
                      </button>
                      {contest.solution_link && contest.status === 'past' && (
                        <a
                          href={contest.solution_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-200"
                        >
                          <PlayCircle className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {contest.status === 'current' ? 'Join Now' : 'Details'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredContests.length === 0 && !error && (
            <div className="text-center text-gray-600 dark:text-gray-300 mt-12">
              No {filterMode} contests found for the selected platforms.
            </div>
          )}

          {/* Admin Modal */}
          {isAdminModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Add Solution Link</h2>
                <form onSubmit={handleAddSolution} className="space-y-4">
                  <div>
                    <label htmlFor="contest" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Select Contest
                    </label>
                    <select
                      id="contest"
                      value={selectedContest}
                      onChange={e => setSelectedContest(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">-- Select a contest --</option>
                      {contests.filter(c => c.status === 'past').map(contest => (
                        <option key={contest.id} value={contest.id}>
                          {contest.platform} - {contest.name} ({format(new Date(contest.start_time), 'MMM d, yyyy')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="solutionLink" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      YouTube Solution Link
                    </label>
                    <input
                      id="solutionLink"
                      type="url"
                      value={solutionLink}
                      onChange={e => setSolutionLink(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className={cn(
                        'flex-1 py-3 rounded-full text-sm font-medium text-white',
                        'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
                        'transition-all duration-300'
                      )}
                    >
                      Add Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdminModalOpen(false)}
                      className="flex-1 py-3 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}