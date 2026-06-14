import { Component, ReactNode } from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 m-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-mono text-sm whitespace-pre-wrap">
          <div className="font-bold mb-2">Render error:</div>
          <div>{this.state.error.message}</div>
          <div className="mt-3 text-xs opacity-70">{this.state.error.stack}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
