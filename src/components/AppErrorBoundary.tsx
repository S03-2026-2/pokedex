import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

export default class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Falha inesperada ao renderizar a Pokédex.", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-container">
        <div className="empty-state glass-panel" role="alert">
          <h1>Falha ao abrir a Pokédex</h1>
          <p>Tente abrir a Pokédex novamente.</p>
          <button
            type="button"
            className="reset-filters-btn"
            onClick={() => this.setState({ hasError: false })}
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }
}
