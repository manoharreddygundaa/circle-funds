import { useState, useEffect, useCallback } from 'react';

/**
 * Generic fetch hook.
 * Usage:
 *   const { data, loading, error, refetch } = useFetch('/loans?status=approved');
 *
 * The fetcher function is passed in as a prop so we can swap between
 * api.get, loanService.getAll, etc. — keeping this hook flexible.
 */
const useFetch = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // fetcher can be a function () => api.get('/loans') OR a direct promise
      const res = typeof fetcher === 'function' ? await fetcher() : await fetcher;
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useFetch;
