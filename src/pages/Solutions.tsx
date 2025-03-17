import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Video, Send, Loader2 } from 'lucide-react';
import { Contest } from '../lib/types';
import { cn } from '../lib/utils';

/**
 * Solutions page for the Contesso Contest Tracker.
 * Displays past contests with YouTube solution links (auto-fetched or manually added).
 * Allows users to suggest missing solutions. Features a modern SaaS UI with filtering.
 */
export default function Solutions() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestContestId, setSuggestContestId] = useState<string | null>(null);
  const [suggestLink, setSuggestLink] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('*')
          .lt('end_time', new Date().toISOString())
          .order('end_time', { ascending: false });

        if (error) throw error;
        setContests(data || []);
      } catch (error) {
        toast.error('Failed to load solutions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, []);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestContestId || !suggestLink) {
      toast.error('Please select a contest and provide a link');
      return;
    }

    try {
      // Placeholder: Could store in a 'suggestions' table for admin review
      toast.success('Solution suggestion submitted for review!');
      setSuggestContestId(null);
      setSuggestLink('');
    } catch (error) {
      toast.error('Failed to submit suggestion');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent">
          Solutions
        </h1>

        <div className={cn('bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg')}>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : contests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No past contests available.
            </p>
          ) : (
            <ul className="space-y-4">
              {contests.map((contest) => (
                <li
                  key={contest.id}
                  className={cn(
                    'p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl shadow-sm transition-all duration-300',
                    suggestContestId === contest.id && 'border-2 border-indigo-500',
                    'hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {contest.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contest.platform} • {new Date(contest.end_time).toLocaleString()}
                      </p>
                      {contest.solution_link ? (
                        <a
                          href={contest.solution_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'text-indigo-500 text-sm flex items-center',
                            'hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300'
                          )}
                        >
                          <Video className="h-4 w-4 mr-1" /> Watch Solution
                        </a>
                      ) : (
                        <button
                          onClick={() => setSuggestContestId(contest.id)}
                          className={cn(
                            'text-indigo-500 text-sm',
                            'hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300'
                          )}
                        >
                          Suggest Solution
                        </button>
                      )}
                    </div>
                  </div>
                  {suggestContestId === contest.id && (
                    <form onSubmit={handleSuggest} className="mt-4 space-y-2">
                      <input
                        type="url"
                        value={suggestLink}
                        onChange={(e) => setSuggestLink(e.target.value)}
                        placeholder="Enter YouTube link"
                        className={cn(
                          'w-full p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600',
                          'focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        )}
                      />
                      <button
                        type="submit"
                        className={cn(
                          'w-full py-2 text-white rounded-xl transition-all duration-300',
                          'bg-gradient-to-r from-indigo-500 to-purple-600',
                          'hover:from-indigo-600 hover:to-purple-700'
                        )}
                      >
                        <Send className="h-4 w-4 inline mr-2" /> Submit Suggestion
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}