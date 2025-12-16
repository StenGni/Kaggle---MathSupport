
import React, { useState, useEffect } from 'react';
import { RefreshCw, Eye, EyeOff, ChevronRight, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, XCircle, Trophy, Info, X, HelpCircle } from 'lucide-react';
import { generatePractice } from '../services/geminiService';
import { getMastery, getSkills, resolveSkill } from '../services/storage';
import { PracticeProblem, UserMastery } from '../types';
import { MATH_TAXONOMY, findSkillById } from '../data/taxonomy';
import LatexRenderer from './LatexRenderer';

// Modes: 'DASHBOARD' (list of weaknesses) | 'SESSION' (active practice) | 'SUCCESS' (skill mastered)
type Mode = 'DASHBOARD' | 'SESSION' | 'SUCCESS';

const PracticeView: React.FC = () => {
  const [mode, setMode] = useState<Mode>('DASHBOARD');
  const [mastery, setMastery] = useState<UserMastery>({});
  const [loading, setLoading] = useState(false);
  
  // Session State
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // New General Practice State
  const [isGeneralMode, setIsGeneralMode] = useState(false);
  const [sessionTargets, setSessionTargets] = useState<Set<string>>(new Set());
  const [skillProgress, setSkillProgress] = useState<Record<string, number>>({});
  const MASTERY_GOAL = 5;
  
  const [hasMistake, setHasMistake] = useState(false);

  // Accordion state for dashboard
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = () => {
    const data = getMastery();
    setMastery(data);
    setMode('DASHBOARD');
  };

  const toggleCategory = (catId: string) => {
    const newSet = new Set(expandedCats);
    if (newSet.has(catId)) {
        newSet.delete(catId);
    } else {
        newSet.add(catId);
    }
    setExpandedCats(newSet);
  };

  const startPractice = async (specificSkillId?: string) => {
    setLoading(true);
    
    // Setup targets
    const newTargets = new Set<string>();
    if (specificSkillId) {
        newTargets.add(specificSkillId);
        setIsGeneralMode(false);
    } else {
        // General Mode: Target all skills with errors
        const allData = getMastery();
        Object.keys(allData).forEach(id => {
            if (allData[id].errorCount > 0) newTargets.add(id);
        });
        setIsGeneralMode(true);
    }

    setSessionTargets(newTargets);
    setSkillProgress({});
    setProblems([]);
    setCurrentIndex(0);
    setCorrectCount(0); // Only used for specific mode visuals
    setShowAnswer(false);
    setHasMistake(false);

    if (newTargets.size === 0 && !specificSkillId) {
        alert("No problem areas to practice! Great job.");
        setLoading(false);
        return;
    }

    await fetchMoreProblems(Array.from(newTargets));
    setMode('SESSION');
  };

  const fetchMoreProblems = async (targetIds: string[]) => {
      if (targetIds.length === 0) return;
      
      setLoading(true);
      try {
          const targetString = targetIds.join(", ");
          const response = await generatePractice(targetString);
          
          const newProblems: PracticeProblem[] = response.problems.map((p, index) => ({
              id: Date.now() + index.toString(),
              ...p
          }));

          setProblems(prev => [...prev, ...newProblems]);
      } catch (error) {
          console.error(error);
          alert("Failed to generate problems.");
      } finally {
          setLoading(false);
      }
  };

  const [correctCount, setCorrectCount] = useState(0); // Legacy for single-skill UI

  const handleEvaluation = (isCorrect: boolean) => {
    if (isCorrect) {
        const currentProblem = problems[currentIndex];
        
        // Identify which skill this problem counts towards
        // Prefer the problem's own skillId if it matches a target, otherwise try to map
        let targetId = currentProblem.skillId;
        
        // If AI didn't tag it, or tagged unrelated, find a matching target if we are in specific mode
        if (!targetId && !isGeneralMode && sessionTargets.size === 1) {
            targetId = Array.from(sessionTargets)[0];
        }

        if (targetId) {
            // Update progress for this skill
            const currentVal = skillProgress[targetId] || 0;
            const newVal = currentVal + 1;
            
            setSkillProgress(prev => ({ ...prev, [targetId!]: newVal }));

            // Update legacy counter for visual compatibility
            if (!isGeneralMode) setCorrectCount(newVal);

            // Check mastery
            if (newVal >= MASTERY_GOAL) {
                // Skill Mastered!
                resolveSkill(targetId);
                
                const newTargets = new Set(sessionTargets);
                newTargets.delete(targetId);
                setSessionTargets(newTargets);
                
                // If this was the last target, we are done
                if (newTargets.size === 0) {
                    setMode('SUCCESS');
                    return;
                }
            }
        }
        
        loadNextProblem();
    } else {
        setHasMistake(true);
    }
  };

  const loadNextProblem = () => {
      setShowAnswer(false);
      setHasMistake(false);

      if (currentIndex < problems.length - 1) {
          setCurrentIndex(prev => prev + 1);
      } else {
          // We ran out of problems but targets remain?
          if (sessionTargets.size > 0) {
              fetchMoreProblems(Array.from(sessionTargets));
              setCurrentIndex(prev => prev + 1);
          } else {
              setMode('SUCCESS');
          }
      }
  };

  // --- RENDERERS ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <RefreshCw className="w-12 h-12 animate-spin mb-4 text-emerald-600" />
        <p className="font-medium">Generating targeted exercises...</p>
        <p className="text-xs mt-2">Creating problems based on your specific history</p>
      </div>
    );
  }

  // SUCCESS VIEW
  if (mode === 'SUCCESS') {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-fade-in p-6">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Trophy size={48} className="text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                  {isGeneralMode ? "General Practice Complete!" : "Skill Mastered!"}
              </h1>
              <p className="text-slate-600 max-w-xs">
                  {isGeneralMode 
                    ? "You've successfully addressed all your current problem areas." 
                    : "You've solved 5 problems correctly. This skill has been removed from your problem areas."}
              </p>
              <button 
                  onClick={loadDashboard}
                  className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-transform active:scale-95"
              >
                  Back to Dashboard
              </button>
          </div>
      );
  }

  // DASHBOARD VIEW
  if (mode === 'DASHBOARD') {
    const totalErrors: number = Object.values(mastery).reduce((acc: number, curr: any) => acc + (curr.errorCount || 0), 0) as number;
    const trackedSkillIds = new Set(Object.keys(mastery));
    const categorizedSkillIds = new Set<string>();

    return (
        <div className="flex flex-col h-full overflow-hidden">
             {/* Header String - Minimal for Dashboard */}
            <div className="w-full h-10 bg-white border-b border-slate-200 flex items-center justify-end px-4 flex-shrink-0 z-30">
                 <button 
                    onClick={() => setIsHelpOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
                    title="Help & Guide"
                >
                    <Info size={20} />
                </button>
            </div>

            <div className="flex-1 flex flex-col p-6 space-y-6 pb-20 overflow-y-auto no-scrollbar">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Practice</h1>
                    <p className="text-slate-500 text-sm">
                        {totalErrors > 0 
                            ? `We found ${totalErrors} issue${totalErrors > 1 ? 's' : ''} in your recent work.` 
                            : "No specific issues found yet. Keep analyzing!"}
                    </p>
                </div>

                {/* Main Action */}
                <div className="bg-emerald-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="font-bold text-lg mb-1">General Practice</h2>
                        <p className="text-emerald-200 text-sm mb-4">Mix of all identified weak points</p>
                        <button 
                            onClick={() => startPractice()}
                            disabled={totalErrors === 0}
                            className="bg-white text-emerald-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Session
                        </button>
                    </div>
                </div>

                {/* Hierarchical List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Problem Areas by Category</h3>
                    
                    {totalErrors === 0 && (
                        <div className="text-center py-8 bg-white rounded-xl border border-slate-200 border-dashed text-slate-400 px-4">
                            <p>No active problem areas.</p>
                            <p className="text-xs mt-1 leading-relaxed">
                                Upload your exercises in the <b>Analyze</b> section to identify your weak points and generate targeted practice.
                            </p>
                        </div>
                    )}

                    {MATH_TAXONOMY.map(cat => {
                        // Calculate errors for this category
                        let catErrors = 0;
                        let hasVisibleSkills = false;

                        const activeSubCats = cat.subCategories.map(sub => {
                            const activeSkills = sub.skills.filter(skill => {
                            const skillData = mastery[skill.id];
                            const count = skillData ? skillData.errorCount : 0;
                            const hasError = count > 0;
                            if (hasError) categorizedSkillIds.add(skill.id);
                            return hasError;
                            });
                            
                            const subErrors = activeSkills.reduce((acc, s) => {
                                const skillData = mastery[s.id];
                                return acc + (skillData ? skillData.errorCount : 0);
                            }, 0);
                            
                            if (subErrors > 0) hasVisibleSkills = true;
                            catErrors += subErrors;
                            return { ...sub, activeSkills, subErrors };
                        }).filter(sub => sub.activeSkills.length > 0);

                        if (!hasVisibleSkills) return null;

                        const isExpanded = expandedCats.has(cat.id);

                        return (
                            <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <button 
                                    onClick={() => toggleCategory(cat.id)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                            {catErrors}
                                        </span>
                                        <span className="font-semibold text-slate-800">{cat.name}</span>
                                    </div>
                                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                </button>

                                {isExpanded && (
                                    <div className="divide-y divide-slate-100">
                                        {activeSubCats.map(sub => (
                                            <div key={sub.id} className="p-4 bg-white pl-12">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{sub.name}</h4>
                                                <div className="space-y-2">
                                                    {sub.activeSkills.map(skill => (
                                                        <div key={skill.id} className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-2">
                                                                <AlertCircle size={14} className="text-amber-500" />
                                                                <span className="text-sm text-slate-700 font-medium">{skill.name}</span>
                                                                <span className="text-xs text-slate-400">({mastery[skill.id].errorCount} issues)</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => startPractice(skill.id)}
                                                                className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-medium hover:bg-emerald-100 transition-colors"
                                                            >
                                                                Practice
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Uncategorized Skills Section */}
                    {Array.from(trackedSkillIds).filter(id => !categorizedSkillIds.has(id) && mastery[id].errorCount > 0).length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-amber-500" />
                                    Other Identified Issues
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {Array.from(trackedSkillIds).filter(id => !categorizedSkillIds.has(id) && mastery[id].errorCount > 0).map(id => {
                                    const canonical = findSkillById(id);
                                    const displayName = canonical ? canonical.skill.name : (mastery[id].name || id);
                                    
                                    return (
                                        <div key={id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-700 font-medium">{displayName}</span>
                                                <span className="text-xs text-slate-400">({mastery[id].errorCount} issues)</span>
                                            </div>
                                            <button 
                                                onClick={() => startPractice(id)}
                                                className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-medium hover:bg-emerald-100 transition-colors"
                                            >
                                                Practice
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Help / Info Modal */}
            {isHelpOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                        <button 
                            onClick={() => setIsHelpOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                <HelpCircle size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Practice Guide</h2>
                        </div>

                        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                            <p>
                                This section generates <b>customized math problems</b> based on the weaknesses identified in your Analysis.
                            </p>

                            <div className="space-y-4 mt-4">
                                <div>
                                    <span className="block font-bold text-slate-800 text-sm mb-1">General Practice</span>
                                    <span className="text-xs text-slate-500">A mix of problems targeting all your active weak points at once.</span>
                                </div>

                                <div>
                                    <span className="block font-bold text-slate-800 text-sm mb-1">Category Focus</span>
                                    <span className="text-xs text-slate-500">
                                        Identified weaknesses are categorized here. Work on specific categories to improve. You need to complete 5 exercises correctly for each skill to resolve it.
                                    </span>
                                </div>

                                <div>
                                    <span className="block font-bold text-slate-800 text-sm mb-1">Achieving Mastery</span>
                                    <span className="text-xs text-slate-500">Get <b>5 correct answers</b> in a specific skill to mark it as mastered and remove it from your problem list.</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsHelpOpen(false)}
                            className="w-full mt-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
  }

  // PRACTICE SESSION VIEW
  const currentProblem = problems[currentIndex];

  if (!currentProblem) return null; // Should be handled by loading state

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header String - Session Mode */}
      <div className="w-full h-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
           <button onClick={loadDashboard} className="text-sm text-slate-500 hover:text-slate-800">
                &larr; Exit Session
           </button>
           {!isGeneralMode && (
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Goal: <span className="text-emerald-600 text-sm">{correctCount} / {MASTERY_GOAL}</span>
             </span>
           )}
      </div>

      <div className="flex-1 flex flex-col gap-4 p-6 pb-20 overflow-y-auto no-scrollbar">
        {/* Progress Bar - Only shown in Specific Mode */}
        {!isGeneralMode && (
            <div className="w-full bg-slate-200 h-2 rounded-full mb-2 overflow-hidden flex-shrink-0">
                <div 
                    className="bg-emerald-500 h-full transition-all duration-300" 
                    style={{ width: `${(correctCount / MASTERY_GOAL) * 100}%` }}
                ></div>
            </div>
        )}

        {/* Question Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-50 min-h-[200px] flex flex-col justify-center items-center text-center relative">
            {isGeneralMode && currentProblem.topic && (
                <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">
                    {currentProblem.topic}
                </div>
            )}
            <div className="text-xl font-medium text-slate-800 leading-relaxed">
                <LatexRenderer text={currentProblem.question} />
            </div>
        </div>

        {/* Mistake Feedback Overlay */}
        {hasMistake ? (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl text-center space-y-4 animate-fade-in flex flex-col items-center justify-center">
                <button 
                    onClick={loadNextProblem}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors"
                >
                    Try Next Problem
                </button>
            </div>
        ) : (
            /* Action Area */
            <div className="space-y-4">
                {!showAnswer ? (
                    <button 
                        onClick={() => setShowAnswer(true)}
                        className="w-full py-4 flex items-center justify-center gap-2 text-white font-bold bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                    >
                        <Eye size={20} />
                        Reveal Answer
                    </button>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-slate-800 text-slate-50 p-5 rounded-xl shadow-lg">
                            <div className="font-bold text-lg mb-1 text-emerald-400">
                                Answer:
                            </div>
                            <div className="text-xl mb-4 text-emerald-100 flex justify-center">
                                <LatexRenderer text={currentProblem.correctAnswer} block />
                            </div>
                            <div className="h-px bg-slate-700 my-3"></div>
                            <div className="text-slate-300 text-sm italic">
                                <LatexRenderer text={currentProblem.explanation} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleEvaluation(false)}
                                className="py-4 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors flex flex-col items-center justify-center gap-1"
                            >
                                <XCircle size={24} />
                                <span className="text-xs">I made a mistake</span>
                            </button>
                            <button 
                                onClick={() => handleEvaluation(true)}
                                className="py-4 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors flex flex-col items-center justify-center gap-1"
                            >
                                <CheckCircle2 size={24} />
                                <span className="text-xs">I got it right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default PracticeView;
