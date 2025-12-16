
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Maximize2, X, Tag, Edit2, Check, Eye, Info, HelpCircle, FileText, AlignLeft, Sun, ImageOff } from 'lucide-react';
import CameraInput from './CameraInput';
import { solveExercise, solveExerciseFromText } from '../services/geminiService';
import { saveHistoryItem, trackMistake, updateHistoryItem } from '../services/storage';
import { ExerciseResult, MistakeDetail } from '../types';
import LatexRenderer from './LatexRenderer';
import MathToolbar from './MathToolbar';

interface SolverViewProps {
  initialResult?: ExerciseResult | null;
  onClearResult?: () => void;
}

export default function SolverView({ initialResult, onClearResult }: SolverViewProps = {}) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(initialResult || null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedDetail, setExpandedDetail] = useState<number | null>(null);
  
  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial result
  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
      // History items don't store the full blob/base64 image for persistence currently,
      // so we rely on the text data.
      setPreview(null);
      setError(null);
      setLoading(false);
    }
  }, [initialResult]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setImage(file);
    setError(null);
    setResult(null);
    setExpandedDetail(null);
    setIsEditing(false);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    processImage(file);
  };

  const processImage = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await solveExercise(file);
      
      const newResult: ExerciseResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: "", 
        ...response
      };
      
      setResult(newResult);
      saveHistoryItem(newResult);

      // TRACK MISTAKE IF INCORRECT
      if (!newResult.isCorrect && newResult.mistakes.length > 0) {
        // Use specific Skill ID if available, otherwise topic name
        const trackingId = newResult.skillId || newResult.topic;
        if (trackingId) {
            trackMistake(trackingId, newResult.topic);
        }
      }

    } catch (err) {
      console.error(err);
      setError("Failed to analyze the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setExpandedDetail(null);
    setIsEditing(false);
    if (onClearResult) onClearResult();
  };

  // --- EDITING LOGIC ---
  const startEditing = () => {
    if (!result || !result.problemStatement) return;
    
    // Strip the outer gather environment to make editing easier
    let rawText = result.problemStatement;
    rawText = rawText.replace(/^\\begin\{gather\*?\}/, '').replace(/\\end\{gather\*?\}$/, '').trim();
    
    setEditValue(rawText);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!result) return;
    
    setLoading(true);
    
    try {
        // Re-analyze using the text input
        const reanalysis = await solveExerciseFromText(editValue);
        
        // Update the result with new analysis data, keeping original ID and timestamp
        const updatedResult: ExerciseResult = {
            ...result,
            ...reanalysis,
            problemStatement: reanalysis.problemStatement || editValue
        };

        setResult(updatedResult);
        
        // Update existing history item instead of creating a new one
        updateHistoryItem(updatedResult);
        
        // Track mistakes if the new analysis shows errors
        if (!updatedResult.isCorrect && updatedResult.mistakes.length > 0) {
            const trackingId = updatedResult.skillId || updatedResult.topic;
            if (trackingId) trackMistake(trackingId, updatedResult.topic);
        }
        
    } catch (e) {
        console.error("Analysis failed", e);
        setError("Failed to re-analyze the corrected text.");
    } finally {
        setLoading(false);
        setIsEditing(false);
    }
  };

  const insertLatex = (latex: string, offset: number = 0) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const newValue = editValue.substring(0, start) + latex + editValue.substring(end);
      setEditValue(newValue);
      
      // Restore focus and move cursor
      setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            const newPos = start + latex.length + offset;
            inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };
  
  const getPreviewText = () => {
      // Auto-wrap preview
      if (editValue.includes('\\\\') && !editValue.includes('\\begin')) {
          return `\\begin{gather*} ${editValue} \\end{gather*}`;
      }
      return editValue;
  };

  const isMistakeDetail = (m: MistakeDetail | string): m is MistakeDetail => {
    return (m as MistakeDetail).description !== undefined;
  };

  const renderBoundingBoxes = (mistakes: MistakeDetail[] | string[]) => {
    return mistakes.map((m, i) => {
      if (!isMistakeDetail(m)) return null;
      if (!m.box_2d) return null;
      
      const [ymin, xmin, ymax, xmax] = m.box_2d;
      const top = ymin / 10 + '%';
      const left = xmin / 10 + '%';
      const height = (ymax - ymin) / 10 + '%';
      const width = (xmax - xmin) / 10 + '%';
      
      return (
        <div 
            key={i}
            className="absolute border-2 border-red-500 bg-red-500/10 z-10 pointer-events-none"
            style={{ top, left, height, width }}
        />
      );
    });
  };

  const hasMistakes = result && !result.isCorrect && result.mistakes && result.mistakes.length > 0;

  // Render logic: Show input if no result and no preview.
  // If we have a result (even from history without preview), show the result view.
  const showInput = !preview && !result && !loading;

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Top Header String */}
      <div className="w-full h-10 bg-white border-b border-slate-200 flex items-center justify-end px-4 flex-shrink-0 z-30">
        <button 
            onClick={() => setIsHelpOpen(true)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
            title="About this feature"
        >
            <Info size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar">
        <div className="text-center space-y-2 flex-shrink-0 mb-4 px-2">
            <h1 className="text-2xl font-bold text-slate-800">Help with the exercise</h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            {result ? "Reviewing your solution." : "Upload a problem. I'll check your work and guide you."}
            </p>
        </div>

        {showInput ? (
            <div className="flex-1 flex flex-col justify-start pt-6">
            <CameraInput onFileSelect={handleFileSelect} label="Scan Exercise" minimal />
            </div>
        ) : (
            <div className="flex-1 flex flex-col min-h-0">
            {/* Image Section - Only show if we have a preview or are loading */}
            {(preview || loading) && (
              <div className={`relative flex-shrink-0 mx-auto transition-all duration-500 ease-in-out bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200 group
                  ${result ? 'h-32 w-32' : 'w-full max-w-sm aspect-[3/4] mb-4'} ${!preview && !loading ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={() => preview && setIsModalOpen(true)}
              >
                  {preview ? (
                    <>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={preview} className="w-full h-full object-cover" />
                      {result && renderBoundingBoxes(result.mistakes)}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <ImageOff size={24} className="mb-2 opacity-50" />
                      <span className="text-[10px] uppercase font-bold tracking-wide">Image not available</span>
                    </div>
                  )}

                  {loading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm p-4 text-center cursor-default">
                      <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
                      <p className="text-white font-medium text-sm">Analyzing...</p>
                  </div>
                  )}
              </div>
            )}

            {/* Results Section */}
            <div className="flex-1 mt-4 px-1 pb-32">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 animate-fade-in mb-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium">Analysis Failed</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button 
                        onClick={() => image && processImage(image)}
                        className="mt-3 text-sm bg-red-100 px-3 py-1 rounded-full font-medium hover:bg-red-200 transition-colors"
                        >
                        Try Again
                        </button>
                    </div>
                    </div>
                )}

                {result && !loading && (
                    <div className="space-y-4 animate-fade-in">
                        
                        {/* Problem Statement / Calculation */}
                        {result.problemStatement && (
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wide text-slate-400">Calculation</h4>
                                    {!isEditing ? (
                                        <button 
                                            onClick={startEditing}
                                            className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
                                        >
                                            <Edit2 size={12} /> Fix
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={saveEdit} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow hover:bg-emerald-700 flex items-center gap-1"><Check size={12}/> Save</button>
                                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-300 flex items-center gap-1"><X size={12}/> Cancel</button>
                                        </div>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <Eye size={14}/> Live Preview
                                            </label>
                                            {/* Large Live Preview matching Analyzer View style */}
                                            <div className="bg-white border-2 border-emerald-100 p-6 rounded-xl min-h-[120px] shadow-inner flex flex-col justify-center">
                                                <div className="text-lg text-slate-800 overflow-x-auto text-center">
                                                    <LatexRenderer text={getPreviewText()} block />
                                                </div>
                                            </div>

                                            <MathToolbar onInsert={insertLatex} />
                                            
                                            {/* Formula Input Bar */}
                                            <div className="relative">
                                                <textarea 
                                                    ref={inputRef}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full text-xs p-3 pt-3 pb-6 bg-slate-800 text-slate-300 rounded-b-xl focus:ring-0 border-0 font-mono resize-y min-h-[80px]"
                                                    placeholder="Edit the entire calculation..."
                                                />
                                                <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Formula Bar</div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 text-center">Tip: Use <b>\\</b> (New Line) to separate steps.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <LatexRenderer text={result.problemStatement} className="text-slate-900 font-medium text-xl leading-relaxed" block />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main Analysis Card */}
                        <div className={`p-4 rounded-xl border-l-4 shadow-sm ${result.isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-amber-50 border-amber-500'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {result.isCorrect ? (
                                    <CheckCircle2 className="text-emerald-600" />
                                ) : (
                                    <AlertCircle className="text-amber-600" />
                                )}
                                <h3 className={`font-bold text-lg ${result.isCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
                                    {result.isCorrect 
                                        ? "Great Job!" 
                                        : (hasMistakes ? "Correction & Analysis" : "Solution Breakdown")}
                                </h3>
                            </div>
                            {result.isCorrect ? (
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    Everything is correct so far, the calculation is just not completed.
                                </p>
                            ) : (
                                <LatexRenderer text={result.explanation || ''} className="text-slate-700 text-sm leading-relaxed" />
                            )}
                        </div>

                        {/* Mistakes List */}
                        {hasMistakes && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    Mistakes Found
                                </h4>
                                {result.mistakes.map((mistake, i) => {
                                    const desc = isMistakeDetail(mistake) ? mistake.description : mistake;
                                    return (
                                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-red-400 border-slate-100">
                                            <div className="flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                                <div className="flex-1">
                                                    <LatexRenderer text={desc || ''} className="text-slate-700 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Next Step */}
                        {result.nextSteps && result.nextSteps.length > 0 && (
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                                    Next Step
                                </h4>
                                <ul className="space-y-2">
                                    {/* Only show the first step */}
                                    {result.nextSteps.slice(0, 1).map((step, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-600">
                                            <span className="text-emerald-500 mt-1.5">•</span>
                                            <div className="flex-1">
                                                <LatexRenderer text={step} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Interactive Step Details */}
                                {result.stepDetails && result.stepDetails.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Tap for details:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.stepDetails.map((detail, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setExpandedDetail(expandedDetail === i ? null : i)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1 ${
                                                        expandedDetail === i 
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-inner' 
                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                                                    }`}
                                                >
                                                    <span className="font-bold text-emerald-500">?</span>
                                                    <LatexRenderer text={`$${detail.text.replace(/^\$|\$$/g, '')}$`} />
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {expandedDetail !== null && result.stepDetails[expandedDetail] && (
                                            <div className="mt-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-sm text-slate-700 animate-fade-in">
                                                <LatexRenderer text={result.stepDetails[expandedDetail].explanation} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Identified Problem (Topic) */}
                        {result.topic && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="font-semibold text-slate-700 mb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Tag size={16} className="text-slate-400" />
                                Identified Problem
                                </h4>
                                <p className="text-slate-900 font-medium capitalize">{result.topic}</p>
                            </div>
                        )}
                    
                        <button 
                            onClick={clear}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium shadow-md hover:bg-slate-800 transition-colors"
                        >
                            Scan Another Problem
                        </button>
                    </div>
                )}
            </div>
            </div>
        )}

      {/* Full Screen Image Modal - Only if preview exists */}
      {isModalOpen && preview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
                <X size={24} />
            </button>
            <div className="relative max-w-full max-h-full">
                 {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img src={preview} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
                {result && (
                     <div className="absolute inset-0 w-full h-full pointer-events-none">
                         {renderBoundingBoxes(result.mistakes)}
                     </div>
                )}
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
                    {/* Updated Title */}
                    <h2 className="text-xl font-bold text-slate-800">Help with the exercise</h2>
                </div>

                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    
                    <div>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Include your calculation steps for the best feedback.</li>
                            <li>If the app misreads your handwriting, use the <b>"Fix"</b> button to edit the math manually.</li>
                        </ul>
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
                                    <span className="block font-bold text-slate-800 text-sm">Structure your work</span>
                                    <span className="text-xs text-slate-500">Try not to split calculations. Put equality signs (=) at the beginning of each row.</span>
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
                            <li>Handwriting recognition may not be perfect. The AI can occasionally make calculation errors. Always verify critical steps.</li>
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
