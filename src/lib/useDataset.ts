import { useCallback, useEffect, useState } from 'react';

export function useDataset<T>(path: string, validate: (v: unknown) => boolean) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${path}`, {
        cache: 'no-cache',
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('HTTP response');
      const value: unknown = await response.json();
      if (!validate(value)) throw new Error('Invalid data');
      setData(value as T);
    } catch {
      setError('This data source could not be loaded. Try again; your calculator still works.');
    } finally {
      setLoading(false);
    }
  }, [path, validate]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, loading, reload };
}
