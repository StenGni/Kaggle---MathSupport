
import React, { useState } from 'react';
import SolverView from './components/SolverView';
import AnalyzerView from './components/AnalyzerView';
import PracticeView from './components/PracticeView';
import HistoryView from './components/HistoryView';
import AuthView from './components/AuthView';
import { AppView, ExerciseResult } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SOLVER);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ExerciseResult | null>(null);

  if (!hasStarted) {
    return <AuthView onAuthSuccess={() => setHasStarted(true)} />;
  }

  const handleHistorySelect = (item: ExerciseResult) => {
    setSelectedHistoryItem(item);
    setCurrentView(AppView.SOLVER);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.SOLVER:
        return (
          <SolverView 
            initialResult={selectedHistoryItem} 
            onClearResult={() => setSelectedHistoryItem(null)} 
          />
        );
      case AppView.ANALYZE:
        return <AnalyzerView onPracticeClick={() => setCurrentView(AppView.PRACTICE)} />;
      case AppView.PRACTICE:
        return <PracticeView />;
      case AppView.PROFILE:
        return (
          <HistoryView 
            onSelect={handleHistorySelect}
          />
        );
      default:
        return <SolverView />;
    }
  };

  return (
    <div className="h-screen w-full bg-[#ddead1] flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden text-slate-900 font-sans">
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 flex justify-between items-stretch z-50 absolute bottom-0 w-full pb-safe h-16">
        <NavButton 
          active={currentView === AppView.SOLVER} 
          onClick={() => setCurrentView(AppView.SOLVER)}
          label="Solve"
        />
        <NavButton 
          active={currentView === AppView.ANALYZE} 
          onClick={() => setCurrentView(AppView.ANALYZE)}
          label="Analyze"
        />
        <NavButton 
          active={currentView === AppView.PRACTICE} 
          onClick={() => setCurrentView(AppView.PRACTICE)}
          label="Practice"
        />
        <NavButton 
          active={currentView === AppView.PROFILE} 
          onClick={() => setCurrentView(AppView.PROFILE)}
          label="History"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center relative transition-colors ${active ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
  >
    <span className={`text-sm font-bold tracking-wide transition-colors ${active ? 'text-emerald-900' : 'text-slate-400'}`}>
      {label}
    </span>
    {/* Emerald String/Underline */}
    <div className={`absolute bottom-0 left-0 w-full h-1 bg-emerald-600 transition-transform duration-300 origin-center ${active ? 'scale-x-100' : 'scale-x-0'}`} />
  </button>
);

export default App;
