import { useState, useEffect } from 'react';
import { MatchData } from '@/types/match';

const BASE_URL = 'https://api.neatqueue.com/api/v1/history/1225010401000034425';

interface UseMatchDataOptions {
  startDate?: string;
  endDate?: string;
}

export const useMatchData = (options?: UseMatchDataOptions) => {
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startDate = options?.startDate || '2025-09-08';
  const endDate = options?.endDate;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `${BASE_URL}?page_size=1000&start_date=${startDate}&limit=1000&order=asc`;
        if (endDate) {
          url += `&end_date=${endDate}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching match data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, loading, error };
};
