import { useState, useEffect } from 'react';
import { fetchHomePageData } from '@/api/articles';
import type { HomePageData } from '@/types';

/**
 * Client-side component that fetches home page data and displays it as formatted JSON.
 * Used for debugging / data inspection at /test route.
 */
export default function TestHomeData() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchHomePageData('en');
        if (cancelled) return;

        if (result === null) {
          setError(true);
        } else {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || data === null) {
    return <p>Failed to load home page data.</p>;
  }

  return (
    <pre className="font-mono p-4 overflow-auto bg-gray-50 rounded text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
