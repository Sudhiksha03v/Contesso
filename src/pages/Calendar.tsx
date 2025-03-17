// src/pages/Calendar.tsx
import { useState, useEffect } from 'react';
import { Bookmark, Clock, Filter, AlertTriangle, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { Contest as BaseContest } from '../lib/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Contest extends BaseContest {
  isBookmarked?: boolean;
  status: 'upcoming' | 'past';
}

export default function CalendarPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['Codeforces', 'CodeChef', 'LeetCode']));
  const [filterMode, setFilterMode] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContest, setNewContest] = useState({ name: '', platform: 'Codeforces', start_time: '', duration: '' });

  // Fetch contests from Supabase
  const fetchContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const { data: syncedContests, error: fetchError } = await supabase.from('contests').select('*');
      if (fetchError) throw fetchError;

      const { data: bookmarks } = await supabase.from('bookmarks').select('contest_id');
      const bookmarkSet = new Set(bookmarks?.map(b => b.contest_id)); // Fixed typo: b.contest_id instead of bコンテスト_id

      const contestsWithBookmarks = syncedContests.map(contest => ({
        ...contest,
        isBookmarked: bookmarkSet.has(contest.id),
        status: new Date(contest.start_time) > now ? 'upcoming' : 'past',
      }));

      setContests(contestsWithBookmarks);
    } catch (err) {
      setError('Failed to fetch contests. Displaying cached data if available.');
      console.error('Fetch error:', err);

      const { data: cachedContests } = await supabase.from('contests').select('*');
      if (cachedContests) {
        const { data: bookmarks } = await supabase.from('bookmarks').select('contest_id');
        const bookmarkSet = new Set(bookmarks?.map(b => b.contest_id));
        const now = new Date();
        setContests(cachedContests.map(c => ({
          ...c,
          isBookmarked: bookmarkSet.has(c.id),
          status: new Date(c.start_time) > now ? 'upcoming' : 'past',
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter contests
  useEffect(() => {
    const now = new Date();
    const filtered = contests.filter(contest => {
      const isPast = new Date(contest.start_time) < now;
      if (filterMode === 'upcoming') return selectedPlatforms.has(contest.platform) && !isPast;
      if (filterMode === 'past') return selectedPlatforms.has(contest.platform) && isPast;
      return selectedPlatforms.has(contest.platform); // 'all'
    });
    setFilteredContests(filtered);
  }, [contests, selectedPlatforms, filterMode]);

  // Fetch contests on mount and refresh periodically
  useEffect(() => {
    fetchContests();
    const interval = setInterval(fetchContests, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Toggle bookmark
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

  // Toggle platform filter
  const togglePlatform = (platform: string) => {
    const newPlatforms = new Set(selectedPlatforms);
    if (newPlatforms.has(platform)) newPlatforms.delete(platform);
    else newPlatforms.add(platform);
    setSelectedPlatforms(newPlatforms);
  };

  // Calculate time remaining
  const getTimeRemaining = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ended';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
  };

  // Calendar tile content
  const tileContent = ({ date }: { date: Date }) => {
    const dayContests = contests.filter(c => isSameDay(new Date(c.start_time), date));
    return dayContests.length > 0 ? (
      <div className="flex justify-center">
        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
      </div>
    ) : null;
  };

  // Handle calendar change
  const handleCalendarChange = (value: Date | null | [Date | null, Date | null]) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  // Handle adding a new contest
  const handleAddContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContest.name || !newContest.start_time || !newContest.duration) {
      toast.error('Please fill in all fields');
      return;
    }

    const startTime = new Date(newContest.start_time).toISOString();
    const duration = parseInt(newContest.duration, 10);
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();
    const id = `${newContest.platform.toLowerCase()}_${Date.now()}`;

    const newContestData: Contest = {
      id,
      name: newContest.name,
      platform: newContest.platform as 'Codeforces' | 'CodeChef' | 'LeetCode',
      start_time: startTime,
      end_time: endTime,
      duration,
      url: `https://${newContest.platform.toLowerCase()}.com`,
      solution_link: null,
      status: new Date(startTime) > new Date() ? 'upcoming' : 'past',
    };

    const { error } = await supabase.from('contests').insert(newContestData);
    if (error) {
      toast.error('Failed to add contest');
      console.error(error);
    } else {
      setContests(prev => [...prev, { ...newContestData, isBookmarked: false }]);
      setNewContest({ name: '', platform: 'Codeforces', start_time: '', duration: '' });
      setIsAddModalOpen(false);
      toast.success('Contest added successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="pt-28 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Breather Space */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Contest Calendar
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Track all your coding contests in one place.</p>
          </div>

          {/* Error Message with Breather Space */}
          {error && (
            <div className="flex items-center justify-center mb-16 p-4 bg-red-100/80 dark:bg-red-900/80 text-red-700 dark:text-red-200 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Sidebar - Filters and List */}
            <div className="lg:w-1/3 space-y-10">
              {/* Filters */}
              <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <Filter className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filter Contests</h2>
                </div>
                <div className="space-y-4">
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
                  <div className="flex space-x-4 mt-6">
                    {['upcoming', 'past', 'all'].map(mode => (
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
              </div>

              {/* Contest List */}
              <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm h-[60vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contest List</h2>
                {loading ? (
                  <p className="text-gray-600 dark:text-gray-300 text-center">Loading contests...</p>
                ) : filteredContests.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300 text-center">No contests found.</p>
                ) : (
                  <div className="space-y-6">
                    {filteredContests.map(contest => (
                      <div
                        key={contest.id}
                        className="p-4 bg-gray-50/80 dark:bg-gray-900/80 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-1">{contest.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {contest.platform} • {format(new Date(contest.start_time), 'MMM d, h:mm a')}
                            </p>
                            <p className="text-sm mt-1 flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                              <span className={cn(
                                contest.status === 'upcoming' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              )}>
                                {getTimeRemaining(contest.start_time)}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => toggleBookmark(contest.id)}
                            className={cn(
                              'p-2 rounded-full transition-all duration-200',
                              contest.isBookmarked ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                              'hover:bg-indigo-200 dark:hover:bg-indigo-800'
                            )}
                          >
                            <Bookmark className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Calendar with Breather Space */}
            <div className="lg:w-2/3 bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <Calendar
                onChange={handleCalendarChange}
                value={selectedDate}
                tileContent={tileContent}
                className="w-full border-none text-gray-900 dark:text-white bg-transparent mb-12"
              />
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Contests on {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                {contests.filter(c => isSameDay(new Date(c.start_time), selectedDate)).length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300 text-center">No contests scheduled.</p>
                ) : (
                  <div className="space-y-6">
                    {contests.filter(c => isSameDay(new Date(c.start_time), selectedDate)).map(contest => (
                      <div
                        key={contest.id}
                        className="p-4 bg-gray-50/80 dark:bg-gray-900/80 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{contest.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {contest.platform} • {format(new Date(contest.start_time), 'h:mm a')}
                            </p>
                            <p className="text-sm mt-1 flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                              <span className={cn(
                                contest.status === 'upcoming' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              )}>
                                {getTimeRemaining(contest.start_time)}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => toggleBookmark(contest.id)}
                            className={cn(
                              'p-2 rounded-full',
                              contest.isBookmarked ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                              'hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-200'
                            )}
                          >
                            <Bookmark className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Contest Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Add New Contest</h2>
                <form onSubmit={handleAddContest} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Contest Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={newContest.name}
                      onChange={e => setNewContest({ ...newContest, name: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter contest name"
                    />
                  </div>
                  <div>
                    <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Platform
                    </label>
                    <select
                      id="platform"
                      value={newContest.platform}
                      onChange={e => setNewContest({ ...newContest, platform: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Codeforces">Codeforces</option>
                      <option value="CodeChef">CodeChef</option>
                      <option value="LeetCode">LeetCode</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Start Time
                    </label>
                    <input
                      id="start_time"
                      type="datetime-local"
                      value={newContest.start_time}
                      onChange={e => setNewContest({ ...newContest, start_time: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      id="duration"
                      type="number"
                      value={newContest.duration}
                      onChange={e => setNewContest({ ...newContest, duration: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 120"
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
                      Add Contest
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
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