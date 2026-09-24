'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DataRefreshContextValue {
  version: number;
  refresh: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextValue>({
  version: 0,
  refresh: () => {},
});

export function DataRefreshProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((current) => current + 1), []);
  const value = useMemo(() => ({ version, refresh }), [version, refresh]);

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export function useDataRefresh() {
  return useContext(DataRefreshContext);
}
