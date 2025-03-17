// src/pages/Bookmarks.tsx
import { useState, useEffect } from 'react';
import { Bookmark, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Bookmark {
  contest_id: string;
  title: string;
  platform: string;
  start_time: string;
  duration: number;
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase.from('bookmarks').select('*');
    if (!error && data) {
      setBookmarks(data);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          My Bookmarked Contests
        </h1>
        {bookmarks.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">No contests bookmarked yet.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map(bookmark => (
              <div
                key={bookmark.contest_id}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{bookmark.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Platform: {bookmark.platform}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Starts: {new Date(bookmark.start_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> {getTimeRemaining(bookmark.start_time)}
                </p>
                <div className="flex justify-between items-center">
                  <Bookmark className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}