import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="glass p-6 max-w-md text-center">
            <h1 className="font-heading text-2xl mb-2">Something went wrong</h1>
            <p className="text-white/70">Please refresh and try again.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
