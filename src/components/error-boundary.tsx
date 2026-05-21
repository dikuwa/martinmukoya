"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[18px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-6">
          <h2 className="text-balance font-display text-xl font-black text-[color:var(--text-strong)]">
            {this.props.fallbackTitle ?? "Something needs attention"}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            This section could not load. Try refreshing the page.
          </p>
          <Button className="mt-5" variant="secondary" onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
