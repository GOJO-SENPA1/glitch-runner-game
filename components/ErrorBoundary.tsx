'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[v0] Game error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center font-mono">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4" style={{ textShadow: '0 0 20px #FF0000' }}>
              ⚠ SYSTEM ERROR ⚠
            </h1>
            <p className="text-cyan-400 mb-6 text-lg">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400 hover:text-black transition-all"
              style={{ boxShadow: '0 0 20px #00FFFF' }}
            >
              RESTART SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
