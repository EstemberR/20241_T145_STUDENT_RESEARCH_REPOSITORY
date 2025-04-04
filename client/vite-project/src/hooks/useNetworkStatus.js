import { useState, useEffect, useCallback } from 'react';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Function to actively check connection by making a small fetch request
  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Try to fetch a small resource with cache busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/favicon.ico?nocache=' + new Date().getTime(), { 
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setIsOnline(response.ok);
      return response.ok;
    } catch (error) {
      console.log('Connection check failed:', error);
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Check connection immediately on mount
    checkConnection();

    // Set up a periodic connection check every 10 seconds
    const intervalId = setInterval(() => {
      if (!isOnline) {
        checkConnection();
      }
    }, 10000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection, isOnline]);

  const retry = useCallback(() => {
    if (!isChecking) {
      setRetryCount(prev => prev + 1);
      return checkConnection();
    }
    return Promise.resolve(isOnline);
  }, [isChecking, isOnline, checkConnection]);

  return { isOnline, retryCount, retry, isChecking };
};

export default useNetworkStatus;