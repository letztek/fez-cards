import React from 'react';
import { Button } from './Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-red-400 mb-2">
                遊戲發生錯誤
              </h2>
              <p className="text-gray-300 mb-4">
                很抱歉，遊戲遇到了意外錯誤。請嘗試重新開始。
              </p>
              {this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                    查看錯誤詳情
                  </summary>
                  <div className="mt-2 p-2 bg-black/30 rounded text-xs font-mono text-red-300">
                    {this.state.error.message}
                  </div>
                </details>
              )}
              <div className="space-y-2">
                <Button 
                  onClick={this.resetError}
                  variant="primary"
                  className="w-full"
                >
                  重新開始
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  size="small"
                  className="w-full"
                >
                  重新載入頁面
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional error boundary hook for use with React Query or other libraries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};