import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook to fetch data and cache it in localStorage.
 * @param {string} cacheKey - The key for storing data in localStorage.
 * @param {function} fetcher - An async function that fetches and returns the data.
 * @param {number} cacheDurationMs - The duration in milliseconds to keep the cache valid.
 * @param {Array} dependencies - Dependencies for the useCallback and useEffect hooks.
 * @returns {{data: any, error: Error|null, isLoading: boolean, forceRefresh: function}}
 */
const useCachedFetch = (cacheKey, fetcher, cacheDurationMs, dependencies = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const performFetch = useCallback(async (ignoreCache = false) => {
    setIsLoading(true);
    setError(null);

    // 1. Check for cached data
    if (!ignoreCache) {
      try {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          const { timestamp, data: cachedData } = JSON.parse(cachedItem);
          const age = Date.now() - timestamp;
          if (age < cacheDurationMs) {
            setData(cachedData);
            setIsLoading(false);
            return; // Use cached data and skip fetch
          }
        }
      } catch (e) {
        console.error("Failed to read from cache", e);
      }
    }

    // 2. Fetch new data
    try {
      const result = await fetcher();
      setData(result);

      // 3. Save the new result to the cache
      const itemToCache = {
        timestamp: Date.now(),
        data: result,
      };
      localStorage.setItem(cacheKey, JSON.stringify(itemToCache));
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, fetcher, cacheDurationMs, ...dependencies]);

  useEffect(() => {
    performFetch();
  }, [performFetch]);

  return { data, error, isLoading, forceRefresh: () => performFetch(true) };
};

export default useCachedFetch;