import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public handleReset = () => {
    console.log("Clearing cache and resetting due to error...");
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/';
  }

  public render() {
    if (this.state.hasError) {
      // Return a fallback UI that gives the user a way to clear state and recover.
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fafafa', color: '#1a1a1a', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ maxWidth: '600px', backgroundColor: '#fff', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
              Oops! Something went wrong.
            </h1>
            <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: 1.6 }}>
              The application encountered an unexpected error. This is often caused by outdated local data or an interrupted connection.
            </p>
            
            <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left', overflowX: 'auto', fontSize: '0.875rem', color: '#991b1b' }}>
              <code>{this.state.error?.message || "Unknown error"}</code>
            </div>

            <button 
              onClick={this.handleReset}
              style={{
                backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
            >
              Clear Cache & Reload App
            </button>
            <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Clicking this will securely reset your local session and refresh the application.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
