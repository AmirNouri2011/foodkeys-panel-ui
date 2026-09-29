'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '@/context/AuthContext';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { fetchDashboardCompanies, normalizeSearch } from './dashboard-data';

export default function useBusinesses(pageSize = 6) {
  const client = useAxiosPrivate();
  const auth = useAuth() as {
    state?: { token?: string; user?: { id?: number } };
  } | null;
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(normalizeSearch(input));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);
  const query = useQuery(
    ['business-directory', auth?.state?.user?.id, page, pageSize, search],
    ({ signal }) =>
      fetchDashboardCompanies(client, page, pageSize, search, signal),
    { enabled: Boolean(auth?.state?.token), staleTime: 30000, retry: 1 }
  );
  return {
    ...query,
    input,
    setInput,
    page,
    setPage,
    pageSize,
    searching: normalizeSearch(input) !== search,
  };
}
