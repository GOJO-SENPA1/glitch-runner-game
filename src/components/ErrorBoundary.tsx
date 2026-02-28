'use client'

import React, { ReactNode, useState } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[v0] Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen error-screen">
          <div className="error-title">⚠️ ERROR</div>
          <div className="error-message">
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <div className="error-instruction">
            Refresh the page to restart
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
