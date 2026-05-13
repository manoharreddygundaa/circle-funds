import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook for loan listing pages.
 * Handles: filter state, pagination, loading, refetch.
 *
 * Why separate from useFetch?
 * Because loan pages have complex filter state (status, risk, amount range,
 * page number) that changes the API URL — we need the hook to own that state.
 */
const useLoans = (initialFilters = {}) => {
  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 9, ...initialFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Build query string from filter object, stripping empty values
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const res = await api.get('/loans', { params });
      setLoans(res.data.loans);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const changePage = (page) =>
    setFilters((prev) => ({ ...prev, page }));

  const resetFilters = () =>
    setFilters({ page: 1, limit: 9, ...initialFilters });

  return {
    loans,
    pagination,
    filters,
    loading,
    error,
    updateFilter,
    changePage,
    resetFilters,
    refetch: fetchLoans,
  };
};

export default useLoans;
