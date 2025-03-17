import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Settings, Loader2, RefreshCw } from 'lucide-react';
import { Contest, YoutubePlaylist } from '../lib/types';
import { cn } from '../lib/utils';

/**
 * Admin page for the Contesso Contest Tracker.
 * Allows team members to manually add YouTube solution links to past contests and
 * trigger YouTube playlist syncs for auto-fetch. Includes analytics placeholders.
 * Modern SaaS UI with team-only access.
 */
export default function Admin() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [playlists, setPlaylists] = useState<YoutubePlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState<string | null>(null);
  const [solutionLink, setSolutionLink] = useState('');
  const [isTeamMember, setIsTeamMember] = useState(false);

  const predefinedPlaylists = {
    LeetCode: 'PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr',
    Codeforces: 'PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB',
    CodeChef: 'PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr',
  };

  // Fetch data and verify team access
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) throw new Error('Not signed in');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError || profileData?.role !== 'admin') {
          toast.error('Access denied: Team members only');
          setIsTeamMember(false);
          return;
        }
        setIsTeamMember(true);

        const { data: contestData, error: contestError } = await supabase
          .from('contests')
          .select('*')
          .lt('end_time', new Date().toISOString())
          .order('end_time', { ascending: false });

        if (contestError) throw contestError;
        setContests(contestData || []);

        const { data: playlistData, error: playlistError } = await supabase
          .from('youtube_playlists')
          .select('*');

        if (playlistError) throw playlistError;
        setPlaylists(playlistData || []);
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add solution link
  const handleAddSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContest || !solutionLink) {
      toast.error('Please select a contest and provide a link');
      return;
    }

    try {
      const { error } = await supabase
        .from('contests')
        .update({ solution_link: solutionLink })
        .eq('id', selectedContest);

      if (error) throw error;
      toast.success('Solution link added');
      setContests((prev) =>
        prev.map((c) => (c.id === selectedContest ? { ...c, solution_link: solutionLink } : c))
      );
      setSelectedContest(null);
      setSolutionLink('');
    } catch (error) {
      toast.error('Failed to add solution link');
    }
  };

  // Sync YouTube playlist
  const syncPlaylist = async (platform: string) => {
    try {
      const playlistId = predefinedPlaylists[platform as keyof typeof predefinedPlaylists];
      const existing = playlists.find((p) => p.platform === platform);

      if (existing) {
        const { error } = await supabase
          .from('youtube_playlists')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('youtube_playlists').insert({
          platform,
          playlist_id: playlistId,
          last_synced_at: new Date().toISOString(),
        });
        if (error) throw error;
      }

      toast.success(`Sync triggered for ${platform} playlist`);
      // Note: Actual YouTube API sync would be server-side
    } catch (error) {
      toast.error(`Failed to sync ${platform} playlist`);
    }
  };

  if (!isTeamMember) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Access denied: Team only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent">
          Admin Panel
        </h1>

        {/* Add Solution */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Add Solution Link
          </h2>
          <form onSubmit={handleAddSolution} className="space-y-4">
            <select
              value={selectedContest || ''}
              onChange={(e) => setSelectedContest(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a contest</option>
              {contests.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.name} ({contest.platform})
                </option>
              ))}
            </select>
            <input
              type="url"
              value={solutionLink}
              onChange={(e) => setSolutionLink(e.target.value)}
              placeholder="YouTube solution link"
              className="w-full p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
            >
              Add Solution
            </button>
          </form>
        </div>

        {/* Sync Playlists */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sync YouTube Playlists
          </h2>
          <div className="grid gap-4">
            {Object.entries(predefinedPlaylists).map(([platform, playlistId]) => (
              <button
                key={platform}
                onClick={() => syncPlaylist(platform)}
                className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-300"
              >
                <span className="font-medium text-gray-900 dark:text-white">{platform}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {playlistId}
                </span>
                <RefreshCw className="h-5 w-5 text-indigo-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Placeholder */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Analytics (Coming Soon)
          </h2>
          <p className="text-gray-500 dark:text-gray-400">User activity and bookmark stats will appear here.</p>
        </div>
      </div>
    </div>
  );
}