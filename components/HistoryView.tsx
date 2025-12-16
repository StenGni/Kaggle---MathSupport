
import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/storage';
import { ExerciseResult } from '../types';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

interface HistoryViewProps {
  onSelect: (item: ExerciseResult) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelect }) => {
  const [history, setHistory] = useState<ExerciseResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header String */}
      <div className="w-full h-10 bg-white border-b border-slate-200 flex items-center justify-end px-4 flex-shrink-0 z-30">
        {/* Empty header for layout consistency */}
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-6 pb-20 overflow-y-auto no-scrollbar">
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">History</h1>
            <p className="text-slate-500 text-sm">Your learning journey</p>
        </div>

        <div className="space-y-3">
            {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <p>No history yet.</p>
                </div>
            ) : (
                history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => onSelect(item)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group relative"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            {item.isCorrect ? 
                                <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><CheckCircle2 size={16} /> Correct</span> : 
                                <span className="flex items-center gap-1 text-amber-600 text-sm font-medium"><AlertCircle size={16} /> Mistakes</span>
                            }
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 pr-6">{item.topic || 'Untitled Exercise'}</h3>
                        
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-emerald-500 transition-colors">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
