import React from 'react';
import { Superscript, Divide } from 'lucide-react';

interface MathToolbarProps {
  onInsert: (latex: string, cursorOffset?: number) => void;
}

const MathToolbar: React.FC<MathToolbarProps> = ({ onInsert }) => {
  const tools = [
    { label: 'Fraction', icon: <span className="font-serif">½</span>, latex: '\\frac{}{}', offset: -3 },
    { label: 'Power', icon: <Superscript size={14} />, latex: '^{}', offset: -1 },
    { label: 'Root', icon: <span className="font-serif">√</span>, latex: '\\sqrt{}', offset: -1 },
    { label: 'Multiply', icon: <span className="font-serif">×</span>, latex: ' \\cdot ', offset: 0 },
    { label: 'Divide', icon: <Divide size={14} />, latex: ' \\div ', offset: 0 },
    { label: 'New Line', icon: <span className="font-bold">↵</span>, latex: ' \\\\ \n', offset: 0 },
    { label: 'Equals', icon: <span className="font-bold">=</span>, latex: ' = ', offset: 0 },
    { label: 'Log', icon: <span className="text-[10px] font-bold">LOG</span>, latex: '\\log_{}{}', offset: -3 },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border-y border-slate-200 justify-center">
      {tools.map((tool, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onInsert(tool.latex, tool.offset)}
          className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded shadow-sm hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors text-slate-700 active:scale-95"
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default MathToolbar;