
import React from 'react';
import { RuleApplication } from '../types';
import LatexRenderer from './LatexRenderer';

interface DynamicRuleCardProps {
  topic: string;
  rules: RuleApplication[];
}

const MathVisualizations: React.FC<DynamicRuleCardProps> = ({ topic, rules }) => {
  if (!rules || rules.length === 0) return null;

  // Theme logic based on topic
  let rowEven = 'bg-blue-50';
  let rowOdd = 'bg-blue-100/50';

  if (topic.toLowerCase().includes('log')) {
    rowEven = 'bg-[#DEEAF6]';
    rowOdd = 'bg-[#BDD7EE]';
  } else if (topic.toLowerCase().includes('exp') || topic.toLowerCase().includes('power')) {
    rowEven = 'bg-purple-50';
    rowOdd = 'bg-purple-100';
  } else if (topic.toLowerCase().includes('trig')) {
    rowEven = 'bg-indigo-50';
    rowOdd = 'bg-indigo-100';
  }

  return (
    <div className="w-full my-4 rounded-lg overflow-hidden shadow-sm border border-slate-200 animate-fade-in">
      {/* Table Header */}
      <div className="flex bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex-1 p-2 border-r border-slate-100">Rule</div>
        <div className="flex-[2] p-2 border-r border-slate-100">Formula</div>
        <div className="flex-[2] p-2">Applied to Problem</div>
      </div>

      {/* Rows */}
      <div className="text-sm text-slate-800">
        {rules.map((rule, idx) => (
          <div key={idx} className={`flex items-center border-b border-white/50 ${idx % 2 === 0 ? rowEven : rowOdd}`}>
            <div className="flex-1 p-3 font-medium border-r border-slate-200/50">
              {rule.name}
            </div>
            <div className="flex-[2] p-3 border-r border-slate-200/50 overflow-x-auto no-scrollbar">
              {/* Pass raw math string; LatexRenderer handles display mode */}
              <LatexRenderer text={rule.generic} block />
            </div>
            <div className="flex-[2] p-3 overflow-x-auto no-scrollbar">
               {/* Pass raw math string; LatexRenderer handles display mode */}
               <LatexRenderer text={rule.specific} className="text-emerald-700 font-medium" block />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathVisualizations;
