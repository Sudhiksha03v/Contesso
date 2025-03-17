// src/pages/Contests.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Video, Clock, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Contest {
  id: string;
  title: string;
  platform: 'Codeforces' | 'CodeChef' | 'LeetCode';
  startTime: string; // ISO string
  duration: number; // in minutes
  isBookmarked: boolean;
  solutionLink?: string;
}

export default function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['Codeforces', 'CodeChef', 'LeetCode']));
  const [showPast, setShowPast] = useState(false);
  const [selectedContestForSolution, setSelectedContestForSolution] = useState('');
  const [solutionLink, setSolutionLink] = useState('');

  // Fetch contests from platforms (mock data for now)
  const fetchContests = async () => {
    const mockContests: Contest[] = [
      { id: 'cf1', title: 'Codeforces Round 930', platform: 'Codeforces', startTime: '2025-03-20T14:00:00Z', duration: 120, isBookmarked: false },
      { id: 'lc1', title: 'Weekly Contest 441', platform: 'LeetCode', startTime: '2025-03-15T19:30:00-07:00', duration: 90, isBookmarked: false },
      { id: 'cc1', title: 'CodeChef Starters 120', platform: 'CodeChef', startTime: '2025-03-18T15:00:00Z', duration: 180, isBookmarked: false },
      { id: 'cf2', title: 'Codeforces Round 929', platform: 'Codeforces', startTime: '2025-03-10T14:00:00Z', duration: 120, isBookmarked: false },
    ];

    const { data: solutions } = await supabase.from('contest_solutions').select('contest_id, solution_link');
    const solutionMap = new Map(solutions?.map(s => [s.contest_id, s.solution_link]));

    const contestsWithSolutions = mockContests.map(contest => ({
      ...contest,
      solutionLink: solutionMap.get(contest.id) || contest.solutionLink,
    }));

    setContests(contestsWithSolutions);
  };

  // Auto-fetch YouTube solution links (mock for now)
  const autoFetchSolutionLinks = async () => {
    const playlists = {
      Codeforces: 'https://www.youtube.com/playlist?list=PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB',
      LeetCode: 'https://www.youtube.com/playlist?list=PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr',
      CodeChef: 'https://www.youtube.com/playlist?list=PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr',
    };

    const mockLinks = [
      { contestId: 'cf2', link: 'https://www.youtube.com/watch?v=example_cf' },
    ];

    for (const { contestId, link } of mockLinks) {
      await supabase.from('contest_solutions').upsert({ contest_id: contestId, solution_link: link }, { onConflict: 'contest_id' });
    }
  };

  // Filter contests
  useEffect(() => {
    const now = new Date();
    const filtered = contests.filter(contest => {
      const isPast = new Date(contest.startTime) < now;
      return selectedPlatforms.has(contest.platform) && (showPast ? isPast : !isPast);
    });
    setFilteredContests(filtered);
  }, [contests, selectedPlatforms, showPast]);

  // Initial fetch
  useEffect(() => {
    fetchContests();
    autoFetchSolutionLinks();
  }, []);

  // Toggle bookmark and save to Supabase
  const toggleBookmark = async (id: string) => {
    const updatedContests = contests.map(c => 
      c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c
    );
    setContests(updatedContests);

    const bookmarkedContests = updatedContests.filter(c => c.isBookmarked);
    await supabase.from('bookmarks').upsert(
      bookmarkedContests.map(c => ({
        contest_id: c.id,
        title: c.title,
        platform: c.platform,
        start_time: c.startTime,
        duration: c.duration,
      })),
      { onConflict: 'contest_id' }
    );

    // Remove from bookmarks if unbookmarked
    const unbookmarked = contests.find(c => c.id === id && !c.isBookmarked);
    if (unbookmarked) {
      await supabase.from('bookmarks').delete().eq('contest_id', id);
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
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Handle solution link submission
  const handleSolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContestForSolution || !solutionLink) return;

    const { error } = await supabase
      .from('contest_solutions')
      .upsert({ contest_id: selectedContestForSolution, solution_link: solutionLink }, { onConflict: 'contest_id' });

    if (!error) {
      alert('Solution link added successfully!');
      setContests(contests.map(c => 
        c.id === selectedContestForSolution ? { ...c, solutionLink } : c
      ));
      setSelectedContestForSolution('');
      setSolutionLink('');
    } else {
      alert('Error adding solution link.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Contest Tracker
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-indigo-600" />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedPlatforms.has('Codeforces')}
                onChange={() => togglePlatform('Codeforces')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>Codeforces</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedPlatforms.has('CodeChef')}
                onChange={() => togglePlatform('CodeChef')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>CodeChef</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedPlatforms.has('LeetCode')}
                onChange={() => togglePlatform('LeetCode')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>LeetCode</span>
            </label>
          </div>
          <button
            onClick={() => setShowPast(!showPast)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium',
              showPast ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
              'hover:bg-indigo-700 hover:text-white transition-all duration-200'
            )}
          >
            {showPast ? 'Show Upcoming' : 'Show Past'}
          </button>
        </div>

        {/* Contests List */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredContests.map(contest => (
            <div
              key={contest.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{contest.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Platform: {contest.platform}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Starts: {new Date(contest.startTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-1" /> {getTimeRemaining(contest.startTime)}
              </p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleBookmark(contest.id)}
                  className={cn(
                    'p-2 rounded-full',
                    contest.isBookmarked ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                    'hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-200'
                  )}
                >
                  <Bookmark className="h-5 w-5" />
                </button>
                {contest.solutionLink && (
                  <a
                    href={contest.solutionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-200"
                  >
                    <Video className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Solution Form */}
        <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Add Solution Link (Team Only)</h2>
          <form onSubmit={handleSolutionSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Past Contest</label>
              <select
                value={selectedContestForSolution}
                onChange={e => setSelectedContestForSolution(e.target.value)}
                className="w-full p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- Select a contest --</option>
                {contests.filter(c => new Date(c.startTime) < new Date()).map(contest => (
                  <option key={contest.id} value={contest.id}>
                    {contest.title} ({contest.platform})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">YouTube Solution Link</label>
              <input
                type="url"
                value={solutionLink}
                onChange={e => setSolutionLink(e.target.value)}
                placeholder="https://www.youtube.com/..."
                className="w-full p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
            >
              Add Solution
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}