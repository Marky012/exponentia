import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Exponentia Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md space-y-6">
            <div className="relative inline-block">
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
              <div className="absolute inset-0 bg-destructive/10 rounded-full blur-xl" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-orbitron font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground text-sm">
                The realm of Exponentia encountered an unexpected error.
              </p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground/60 font-mono bg-muted/30 rounded-lg p-3 mt-4 text-left overflow-auto max-h-32">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline" className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} className="gap-2">
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
