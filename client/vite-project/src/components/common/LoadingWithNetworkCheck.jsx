import React, { useState, useEffect } from 'react';
import useNetworkStatus from '../../hooks/useNetworkStatus';

const LoadingWithNetworkCheck = () => {
  const { isOnline, retryCount, retry, isChecking } = useNetworkStatus();
  const [showConnectionWarning, setShowConnectionWarning] = useState(false);

  // Add a timeout to show connection warning after 3 seconds of loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowConnectionWarning(true);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // If we already know we're offline, show the offline message immediately
  if (!isOnline) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4">
        <div className="text-center mb-4">
          <i className="fas fa-wifi fa-4x text-danger mb-3"></i>
          <h5 className="mb-3">Unable to connect to the server</h5>
          <p className="text-muted">
            Please check your internet connection and try again.
            {retryCount > 0 && (
              <span> We've tried reconnecting {retryCount} {retryCount === 1 ? 'time' : 'times'}.</span>
            )}
          </p>
          <button 
            className="btn btn-primary mt-2" 
            onClick={retry}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Checking Connection...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt me-2"></i>
                Try Again
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center h-100">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      
      {showConnectionWarning && (
        <div className="text-center mt-3">
          <p className="text-muted">
            Taking longer than expected to load...
          </p>
          <p className="small text-muted">
            Please check your internet connection and try refreshing the page.
          </p>
          <button 
            className="btn btn-outline-primary mt-2" 
            onClick={retry}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Check Connection
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingWithNetworkCheck;