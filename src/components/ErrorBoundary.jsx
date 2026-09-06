import React from 'react';
import * as Sentry from '@sentry/react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 50, color: 'red', background: 'black', minHeight: '100vh', overflow: 'auto' }}>
          <h1>Error!</h1>
          <pre>{this.state.error.toString()}</pre>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
