import React, { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PortfolioPage from './component/PortfolioPage';
import LanguageSwitcher from './component/LanguageSwitcher';
import AllProjects from './component/AllProjects';
import ProjectDetail from './component/ProjectDetail';

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <LanguageSwitcher />
          <Routes>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/projects" element={<AllProjects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;