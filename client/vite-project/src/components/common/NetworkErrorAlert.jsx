import React, { useState, useEffect } from 'react';
import useNetworkStatus from '../../hooks/useNetworkStatus';

const NetworkErrorAlert = () => {
  const { isOnline, retryCount, retry, isChecking } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  // Track connection state changes
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // When connection is restored after being offline
      setShowReconnected(true);
      // Hide the reconnected message after 5 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <>
      {!isOnline && (
        <div 
          className="alert alert-danger d-flex align-items-center position-fixed"
          style={{
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            minWidth: '300px',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          role="alert"
        >
          <div className="d-flex w-100 justify-content-between align-items-center">
            <div>
              <i className="fas fa-wifi me-2"></i>
              <span>No internet connection. Please check your network.</span>
              {retryCount > 0 && (
                <div className="small text-muted mt-1">
                  Tried reconnecting {retryCount} {retryCount === 1 ? 'time' : 'times'}
                </div>
              )}
            </div>
            <button 
              className="btn btn-sm btn-outline-light ms-3" 
              onClick={retry}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Checking...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt me-1"></i> Retry
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isOnline && showReconnected && (
        <div 
          className="alert alert-success d-flex align-items-center position-fixed"
          style={{
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            minWidth: '300px',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          role="alert"
        >
          <div className="d-flex w-100 justify-content-between align-items-center">
            <div>
              <i className="fas fa-wifi me-2"></i>
              <span>Connection restored!</span>
            </div>
            <button 
              className="btn-close" 
              onClick={() => {
                setShowReconnected(false);
                setWasOffline(false);
              }}
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkErrorAlert;