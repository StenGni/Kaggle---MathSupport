
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, TrendingUp, AlertTriangle, Loader2, Search, ChevronDown, ChevronUp, Trash2, Edit2, Check, X, Eye, Info, HelpCircle, FileText, Sun, AlignLeft, AlertCircle, Layers, RefreshCw } from 'lucide-react';
import CameraInput from './CameraInput';
import { analyzeSkills, analyzeMistakeCorrection } from '../services/geminiService';
import { saveSkills, getSkills, trackMistake, saveHistoryItem } from '../services/storage';
import { SkillProfile, IdentifiedSkill, ExerciseResult } from '../types';
import { findSkillById } from '../data/taxonomy';
import LatexRenderer from './LatexRenderer';
import MathToolbar from './MathToolbar';

// Stable Thumbnail Component to prevent URL re-generation loops
const FileThumbnail: React.FC<{ file: File }> = ({ file }) => {
    const [src, setSrc] = useState<string | null>(null);
  
    useEffect(() => {
      const url = URL.createObjectURL(file);
      setSrc(url);
      return () => URL.revokeObjectURL(url);
    }, [file]);
  
    if (!src) return <div className="w-full h-full bg-slate-100 animate-pulse" />;
    return <img src={src} className="w-full h-full object-cover opacity-80" alt="preview" />;
};

export default function AnalyzerView({ onPracticeClick }: { onPracticeClick: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Initialize profile with ID patching for legacy data
  const [profile, setProfile] = useState<SkillProfile | null>(() => {
    const saved = getSkills();
    if (saved && saved.mistakeExamples) {
        // Ensure all examples have IDs (legacy data support)
        saved.mistakeExamples = saved.mistakeExamples.map((ex, i) => ({
            ...ex,
            id: ex.id || `mistake-restored-${Date.now()}-${i}`
        }));
    }
    return saved;
  });

  const [expandedWeaknessId, setExpandedWeaknessId] = useState<string | null>(null);
  
  // Image Preview Modal State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // State for editing calculations
  const [editingMistakeIndex, setEditingMistakeIndex] = useState<number | null>(null);
  // Unified editing state
  const [editFullText, setEditFullText] = useState("");
  // Re-analysis loading state
  const [isAnalyzingMistake, setIsAnalyzingMistake] = useState(false);
  
  // Refs for textareas to handle insertion
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle Preview URL generation
  useEffect(() => {
    if (selectedImage) {
        const url = URL.createObjectURL(selectedImage);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    } else {
        setPreviewUrl(null);
    }
  }, [selectedImage]);

  const handleFileSelect = (fileList: FileList) => {
    // Robustly convert FileList to Array and append
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    // Close preview if the removed file was selected
    if (selectedImage === files[index]) {
        setSelectedImage(null);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProfile(null);
    setExpandedWeaknessId(null);
    setEditingMistakeIndex(null);
    // Note: We do not clear persistent storage here to avoid accidental data loss.
    // The user can overwrite the profile by analyzing new data.
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setExpandedWeaknessId(null);
    try {
      const response = await analyzeSkills(files);
      const newProfile: SkillProfile = {
        strengths: response.strengths,
        weaknesses: response.weaknesses,
        recentTopics: response.topicsIdentified,
        recommendations: response.recommendations,
        skillLevel: response.estimatedSkillLevel,
        mistakeExamples: response.mistakeExamples,
        lastAnalysis: Date.now()
      };
      
      setProfile(newProfile);
      saveSkills(newProfile);

      // SAVE TO HISTORY
      const historyItem: ExerciseResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: "", 
        isCorrect: response.weaknesses.length === 0,
        mistakes: response.weaknesses.map(w => w.name),
        nextSteps: response.recommendations,
        // Removed Estimated Level from explanation string
        explanation: `Skill Analysis Result. Strengths: ${response.strengths.length}, Weaknesses: ${response.weaknesses.length}.`,
        topic: "Skill Analysis",
        skillId: "ANALYSIS",
        problemStatement: "" 
      };
      saveHistoryItem(historyItem);

      // TRACK MISTAKES to Practice Tracker
      const trackedSkills = new Set<string>();

      if (response.mistakeExamples) {
        response.mistakeExamples.forEach(ex => {
          if (ex.skillId) {
            trackMistake(ex.skillId, "Analyzed Weakness");
            trackedSkills.add(ex.skillId);
          } else {
             trackMistake("GENERAL_WEAKNESS", "General Analysis Mistake");
          }
        });
      }
      
      if (response.weaknesses) {
        response.weaknesses.forEach(w => {
            if (w.id && !trackedSkills.has(w.id)) {
                trackMistake(w.id, w.name);
            }
        });
      }

    } catch (error) {
      console.error(error);
      alert("Failed to analyze. Please ensure the photos are clear math work.");
    } finally {
      setLoading(false);
    }
  };

  const stripEnvironment = (latex: string) => {
    if (!latex) return "";
    return latex.replace(/^\s*\\begin\{gather\*?\}\s*/, '').replace(/\s*\\end\{gather\*?\}\s*$/, '').trim();
  };

  const wrapEnvironment = (latex: string) => {
    if (latex.includes('\\\\') && !latex.includes('\\begin')) {
        return `\\begin{gather*} ${latex} \\end{gather*}`;
    }
    return latex;
  };

  // Editing Functions
  const startEditing = (index: number, problem: string, work: string) => {
    setEditingMistakeIndex(index);
    const cleanProblem = stripEnvironment(problem || "");
    const cleanWork = stripEnvironment(work || "");
    const combined = `${cleanProblem} \\\\ ${cleanWork}`;
    setEditFullText(combined);
  };

  const cancelEditing = () => {
    setEditingMistakeIndex(null);
    setEditFullText("");
  };

  const saveEdit = async (index: number) => {
    if (!profile) return;
    
    // Safety check for mistakes array
    const currentMistakes = profile.mistakeExamples || [];
    const mistakeToFix = currentMistakes[index];
    if (!mistakeToFix) return;

    // Split logic
    const parts = (editFullText || "").split('\\\\');
    let newProblem = "";
    let newWork = "";

    if (parts.length > 0) {
        newProblem = parts[0].trim();
        if (parts.length > 1) {
            newWork = parts.slice(1).join('\\\\').trim();
        }
    } else {
        newProblem = editFullText;
    }

    newProblem = wrapEnvironment(newProblem);
    newWork = wrapEnvironment(newWork);

    setIsAnalyzingMistake(true);
    try {
        const analysis = await analyzeMistakeCorrection(newProblem, newWork);
        
        // Deep copy the array to ensure React triggers update
        const updatedExamples = [...currentMistakes];
        let newWeaknesses = [...(profile.weaknesses || [])];
        
        if (analysis.isCorrect) {
             // If correct, remove it
             updatedExamples.splice(index, 1);
             alert("The corrected calculation is mathematically valid! It has been removed from your list of mistakes.");

             // Update Skill Weaknesses if solved
             const skillId = mistakeToFix.skillId;
             if (skillId) {
                const remaining = updatedExamples.filter(e => e.skillId === skillId).length;
                if (remaining === 0) {
                    newWeaknesses = newWeaknesses.filter(w => w.id !== skillId);
                }
             }

        } else {
             // If incorrect, update
             updatedExamples[index] = {
                ...updatedExamples[index],
                problem: newProblem || "",
                studentWork: newWork || "",
                correction: analysis.correction || "",
                mistakeExplanation: analysis.explanation || "No explanation provided.",
                skillId: analysis.skillId || updatedExamples[index].skillId
            };
        }

        const newProfile = { 
            ...profile, 
            mistakeExamples: updatedExamples,
            weaknesses: newWeaknesses
        };
        
        setProfile(newProfile);
        saveSkills(newProfile);
        
        setEditingMistakeIndex(null);
        
    } catch (e) {
        console.error("Failed to re-analyze mistake", e);
        alert("Failed to verify correction. Please try again.");
    } finally {
        setIsAnalyzingMistake(false);
    }
  };

  const insertLatex = (latex: string, offset: number = 0) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const newValue = editFullText.substring(0, start) + latex + editFullText.substring(end);
      setEditFullText(newValue);
      
      setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            const newPos = start + latex.length + offset;
            inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  const renderSkillTag = (skill: IdentifiedSkill | string, type: 'strength' | 'weakness') => {
    const isObj = typeof skill !== 'string';
    let name = isObj ? skill.name : skill;
    const id = isObj ? skill.id : undefined;

    if (id) {
        const canonical = findSkillById(id);
        if (canonical) {
            name = canonical.skill.name;
        }
    }
    
    if (type === 'weakness' && id) {
        return (
            <button 
                key={id}
                onClick={() => setExpandedWeaknessId(expandedWeaknessId === id ? null : id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border shadow-sm transition-all flex items-center gap-1 ${
                    expandedWeaknessId === id 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'bg-white text-red-600 border-red-100 hover:border-red-300'
                }`}
            >
                {name}
                {expandedWeaknessId === id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
        );
    }

    const colors = type === 'strength' 
        ? 'bg-white text-emerald-600 border-emerald-100' 
        : 'bg-white text-red-600 border-red-100';

    return (
        <span key={isObj ? skill.id : skill} className={`px-3 py-1 ${colors} text-xs font-medium rounded-full border shadow-sm`}>
            {name}
        </span>
    );
  };

  const selectedWeakness = expandedWeaknessId && profile?.weaknesses 
    ? profile.weaknesses.find(w => w.id === expandedWeaknessId)
    : null;

  const filteredMistakes = expandedWeaknessId && profile?.mistakeExamples 
    ? profile.mistakeExamples.filter(ex => ex.skillId === expandedWeaknessId)
    : [];

  const getPreviewText = () => {
    if (editFullText.includes('\\\\') && !editFullText.includes('\\begin')) {
        return `\\begin{gather*} ${editFullText} \\end{gather*}`;
    }
    return editFullText;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header String */}
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
        <div className="text-center space-y-2 mb-2">
            <h1 className="text-2xl font-bold text-slate-800">Skill Analysis</h1>
            <p className="text-slate-500 text-sm">Upload photos of your past homework or tests to find your strengths and weaknesses.</p>
        </div>

        {/* Input Section */}
        {files.length === 0 ? (
            <div className="px-2">
                <CameraInput onFileSelect={handleFileSelect} multiple label="Upload Work" minimal />
            </div>
        ) : (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-slate-700">{files.length} pages selected</span>
                    <button onClick={() => setFiles([])} className="text-xs text-red-500 font-medium hover:text-red-700">Clear All</button>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                    {files.map((file, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedImage(file)}
                            className="relative flex-shrink-0 w-16 h-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-emerald-500 transition-colors"
                        >
                            <FileThumbnail file={file} />
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(idx);
                                }}
                                className="absolute top-0 right-0 p-1 bg-black/40 text-white hover:bg-red-500 rounded-bl-lg transition-colors backdrop-blur-sm"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
                
                <div className="space-y-3">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <TrendingUp size={20} />}
                        {loading ? 'Analyzing...' : 'Analyze My Skills'}
                    </button>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-2 text-xs text-slate-400 font-medium">OR</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <CameraInput onFileSelect={handleFileSelect} multiple label="Add Another Page" compact />
                    </div>
                </div>
            </div>
        )}

        {/* Results Section */}
        {profile && (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                        <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <AlertTriangle size={18} />
                            Needs Focus
                        </h3>
                        {profile.weaknesses.length === 0 ? (
                             <p className="text-xs text-red-400 italic">No specific weaknesses found.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {profile.weaknesses.map((w) => renderSkillTag(w, 'weakness'))}
                            </div>
                        )}
                    </div>

                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                        <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                            <TrendingUp size={18} />
                            Strong Points
                        </h3>
                        {profile.strengths.length === 0 ? (
                             <p className="text-xs text-emerald-500 italic">No specific strengths found.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {profile.strengths.map((s) => renderSkillTag(s, 'strength'))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Expanded Detail View */}
                {expandedWeaknessId && (
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 animate-fade-in shadow-sm">
                        <div className="mb-4 bg-white p-4 rounded-lg border border-red-100">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wide block mb-1">Concept Explanation</span>
                            <div className="text-sm text-slate-700 leading-relaxed italic">
                                <LatexRenderer text={selectedWeakness?.explanation || 'No explanation available.'} />
                            </div>
                        </div>

                        {filteredMistakes.length > 0 ? (
                            <>
                                <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide px-1">
                                    Identified Mistakes:
                                </h4>
                                <div className="space-y-3">
                                    {filteredMistakes.map((ex, i) => (
                                        <div key={ex.id || i} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                            <div className="bg-slate-50 p-2 rounded text-sm text-slate-700 mb-2 border border-slate-200 overflow-x-auto">
                                                <span className="text-xs text-red-500 font-bold block mb-1">YOUR WORK:</span>
                                                <LatexRenderer text={ex.studentWork || ""} block />
                                            </div>
                                            <div className="text-xs text-slate-600 overflow-x-auto">
                                                <span className="text-emerald-600 font-bold">FIX: </span>
                                                <LatexRenderer text={ex.correction || ""} block />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-2">No specific calculation examples found for this skill in the uploaded image.</p>
                        )}
                    </div>
                )}

                {/* General Mistake Examples Section */}
                {!expandedWeaknessId && profile.mistakeExamples && profile.mistakeExamples.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Search size={18} className="text-red-500" />
                    Mistake Analysis
                    </h3>
                    <div className="space-y-6">
                    {profile.mistakeExamples.map((ex, i) => (
                        <div key={ex.id || i} className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example {i + 1}</span>
                            {editingMistakeIndex === i ? (
                                <div className="flex gap-2 relative z-10">
                                    <button 
                                        onClick={() => saveEdit(i)} 
                                        disabled={isAnalyzingMistake}
                                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {isAnalyzingMistake ? <Loader2 size={14} className="animate-spin" /> : <Check size={14}/>} 
                                        Save
                                    </button>
                                    <button onClick={cancelEditing} className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-300 flex items-center gap-1"><X size={14}/> Cancel</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => startEditing(i, ex.problem, ex.studentWork)}
                                    className="text-emerald-600 text-xs font-bold hover:text-emerald-800 flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                                >
                                    <Edit2 size={14} /> Fix
                                </button>
                            )}
                        </div>

                        {editingMistakeIndex === i ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Eye size={14}/> Full Calculation Preview
                                    </label>
                                    <div className="bg-white border-2 border-emerald-100 p-6 rounded-xl flex items-center justify-center min-h-[120px] shadow-inner overflow-x-auto">
                                        {editFullText ? (
                                            <div className="text-lg text-slate-800">
                                                <LatexRenderer text={getPreviewText()} block />
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 italic text-sm">Preview will appear here...</span>
                                        )}
                                    </div>

                                    <MathToolbar onInsert={insertLatex} />

                                    <div className="relative">
                                        <textarea
                                            ref={inputRef}
                                            value={editFullText}
                                            onChange={(e) => setEditFullText(e.target.value)}
                                            className="w-full text-xs p-3 pt-3 pb-6 bg-slate-800 text-slate-300 rounded-b-xl focus:ring-0 border-0 font-mono resize-y min-h-[80px]"
                                            placeholder="Edit the entire calculation (Problem \\ Student Work)..."
                                        />
                                        <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Formula Bar</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center">Tip: Use <b>\\</b> (New Line) to separate steps.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Problem</span>
                                    <LatexRenderer text={ex.problem || ""} className="text-sm font-medium text-slate-800" block />
                                </div>
                                
                                <div className="bg-red-50 p-3 rounded-lg border border-red-100 relative overflow-x-auto">
                                    <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Your Calculation</span>
                                    <LatexRenderer text={ex.studentWork || ""} className="text-sm text-slate-700" block />
                                </div>
                                
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <div className="mb-2 border-b border-emerald-100 pb-2">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Correction</span>
                                        <div className="overflow-x-auto">
                                            <LatexRenderer text={ex.correction || ""} className="text-sm font-bold text-emerald-800" block />
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-600 leading-relaxed italic">
                                        <LatexRenderer text={ex.mistakeExplanation || ""} />
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* Recommendations */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <BookOpen size={18} className="text-emerald-500" />
                        Recommended Path
                    </h3>
                    <ul className="space-y-3">
                        {profile.recommendations.map((rec, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                <div className="flex-1">
                                    <LatexRenderer text={rec} />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={onPracticeClick}
                        className="w-full mt-6 py-3 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                        Practice These Topics
                    </button>
                </div>

                <button 
                    onClick={handleReset}
                    className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18} />
                    Scan New Work
                </button>
            </div>
        )}

        {/* Full Screen Image Modal */}
        {selectedImage && previewUrl && (
            <div 
                className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in"
                onClick={() => setSelectedImage(null)}
            >
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img src={previewUrl} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
                </div>
                <p className="text-white/70 mt-4 text-sm">Tap X to close</p>
            </div>
        )}

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
                        <h2 className="text-xl font-bold text-slate-800">How Analysis Works</h2>
                    </div>

                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                        
                        <div>
                            <p className="mb-2">
                                Upload photos of your <b>past homework, tests, or exercises</b>.
                            </p>
                            <p>
                                The app analyzes your work to uncover your strengths and weaknesses. Based on this profile, it identifies areas for improvement and prepares <b>customized practice exercises</b> to help you master those skills.
                            </p>
                        </div>
                        
                        {/* Guide Section */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 text-base">Best practices for scanning:</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <div className="mt-0.5 min-w-[32px] h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-800 text-sm">Clear numbers & symbols</span>
                                        <span className="text-xs text-slate-500">Make sure your handwriting is clear and all numbers are visible.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="mt-0.5 min-w-[32px] h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                        <Sun size={18} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-800 text-sm">Good paper & lighting</span>
                                        <span className="text-xs text-slate-500">Use white background paper with good lighting. Avoid shadows.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="mt-0.5 min-w-[32px] h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                        <AlignLeft size={18} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-800 text-sm">Show your steps</span>
                                        <span className="text-xs text-slate-500">Include your full calculations. We analyze the steps to pinpoint exactly which skill needs improvement.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="mt-0.5 min-w-[32px] h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-800 text-sm">Multiple exercises</span>
                                        <span className="text-xs text-slate-500">You can scan a page with several problems, but ensure they are clearly separated by space so the AI can distinguish them.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Limitations Section */}
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 mt-6">
                            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm">
                                <AlertCircle size={14} />
                                Limitations
                            </h3>
                            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
                                <li>Handwriting recognition may not be perfect. Always verify the detected mistakes.</li>
                                <li>The app doesn't work with geometry problems yet.</li>
                                <li>It can understand written comments, parts of the exercise, but only in English.</li>
                            </ul>
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
