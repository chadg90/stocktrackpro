'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackHeight?: number | string;
  chartName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary specifically for chart components
 * Provides graceful degradation when charts fail to render
 */
export default class ChartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const height = this.props.fallbackHeight || 250;
      
      return (
        <div 
          className="flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/10"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          <AlertTriangle className="h-8 w-8 text-yellow-400 mb-3" />
          <p className="text-white/70 text-sm mb-1">
            {this.props.chartName ? `${this.props.chartName} failed to load` : 'Chart failed to load'}
          </p>
          <p className="text-white/50 text-xs mb-3">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
