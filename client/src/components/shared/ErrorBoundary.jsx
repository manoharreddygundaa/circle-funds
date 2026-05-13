import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary — React class component (must be a class, hooks can't do this).
 * Catches any JS error in the component tree below it.
 * Prevents the whole app from crashing white-screen.
 *
 * Usage: wrap <App /> or any subtree.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production you'd send this to Sentry, LogRocket, etc.
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            An unexpected error occurred in the application.
            This has been logged automatically.
          </p>

          {/* Show error in development only */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mb-6 text-left p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <summary className="text-xs font-mono text-red-700 dark:text-red-400 cursor-pointer">
                Error details (dev only)
              </summary>
              <pre className="text-xs text-red-600 dark:text-red-300 mt-2 overflow-auto whitespace-pre-wrap">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.assign('/')}
              className="btn-secondary flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
