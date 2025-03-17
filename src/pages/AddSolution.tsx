// src/pages/AddSolution.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Admin page to add YouTube solution links to past contests.
 */
interface Contest {
  id: string;
  title: string;
  platform: string;
}

export default function AddSolution() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState('');
  const [solutionLink, setSolutionLink] = useState('');
  const navigate = useNavigate();

  // Fetch past contests (mock for now)
  useEffect(() => {
    const fetchPastContests = async () => {
      const mockContests: Contest[] = [
        { id: 'cf2', title: 'Codeforces Round 929', platform: 'Codeforces' },
        // Add more past contests as needed
      ];
      setContests(mockContests);
    };
    fetchPastContests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContest || !solutionLink) return;

    const { error } = await supabase
      .from('contest_solutions')
      .upsert({ contest_id: selectedContest, solution_link: solutionLink }, { onConflict: 'contest_id' });

    if (!error) {
      alert('Solution link added successfully!');
      navigate('/contests');
    } else {
      alert('Error adding solution link.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-16 px-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Add Contest Solution</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Contest</label>
            <select
              value={selectedContest}
              onChange={e => setSelectedContest(e.target.value)}
              className="w-full p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <option value="">-- Select a contest --</option>
              {contests.map(contest => (
                <option key={contest.id} value={contest.id}>
                  {contest.title} ({contest.platform})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">YouTube Solution Link</label>
            <input
              type="url"
              value={solutionLink}
              onChange={e => setSolutionLink(e.target.value)}
              placeholder="https://www.youtube.com/..."
              className="w-full p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}