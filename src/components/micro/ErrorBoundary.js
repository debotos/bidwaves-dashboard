import React from 'react'

import Apology from './Apology'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.logErrorToMyService(error, errorInfo)
  }

  logErrorToMyService(error, errorInfo) {
    console.log(error, errorInfo)
  }

  render() {
    if (this.state.hasError) return <Apology />

    return this.props.children
  }
}

export default ErrorBoundary
