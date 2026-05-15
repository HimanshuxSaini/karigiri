import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[var(--primary)] mb-4">
              Something Went Wrong
            </h1>
            <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
              We're sorry, an unexpected error occurred. Our team has been notified.
              Please try refreshing the page or return to the homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-[var(--primary)] text-white rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-8 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
