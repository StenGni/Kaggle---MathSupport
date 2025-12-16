
import { GoogleGenAI, Type } from "@google/genai";
import { SolverResponse, AnalysisResponse, PracticeGenResponse } from "../types";
import { getTaxonomyPromptContext } from "../data/taxonomy";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const cleanJson = (text: string): string => {
  // Robustly extract JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  
  // Fallback cleanup
  return text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
};

export const solveExercise = async (imageFile: File): Promise<SolverResponse> => {
  const model = "gemini-3-pro-preview";
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `
    You are an expert Mathematics Tutor and OCR Specialist.

    PHASE 0: VISUAL SCANNING & ANCHORING
    - Scan the image from top to bottom.
    - Identify "Anchor Symbols" first: Equality signs (=), Integration symbols, Fraction bars. Use these to orient the rest of the text.
    - **Intent Detection**: Briefly define the math task (e.g. "Simplifying a Fraction", "Solving a Quadratic").

    PHASE 1: LOGICAL STEP TRANSCRIPTION (OCR)
    - **Goal**: Transcribe the math work into a sequence of logical steps.
    - **Output Field**: 'transcribed_lines' (Array of strings).
    - **Rule 1: Logical Segmentation (The "Paper Width" Fix)**:
      - Treat the calculation as a continuous flow.
      - **IGNORE** physical line breaks in the image if they occur in the middle of an expression (e.g. "2 + \\n 3"). **MERGE** them into a single string.
      - **SPLIT** the flow into a new line **ONLY** after an equality sign (=).
    - **Rule 2: Formatting**:
      - Ensure each string in the array ends with an "=" if it is followed by more steps.
      - The final result usually does not end with "=".
      - **Example**:
        User Image:
          "2 * 5 + "
          "3 = 10 + 3"
          "= 13"
        Output: ["2 * 5 + 3 =", "10 + 3 =", "13"]
    - **Rule 3: Split Chained Equations**:
      - If the user wrote "A = B = C" on one line, SPLIT them.
      - Output: ["A =", "B =", "C"]
    - **Rule 4: Transcription Accuracy**:
      - Preserve the exact numbers and operations. Do not autocorrect mistakes.

    PHASE 2: VERIFICATION & ANALYSIS
    - **Ground Truth**: Solve the problem yourself (Ground Truth).
    - **Check User Work**: Compare User Work step-by-step vs Ground Truth.
    - **Mistake Logic**:
      - If Step N to N+1 is mathematically invalid, it is a mistake.
      - **Equivalence**: If User Result == Ground Truth (just unsimplified), it is CORRECT.

    PHASE 3: FEEDBACK
    - **Next Step**: Provide ONE specific, actionable next step with a formula.
    - **Formula**: Explicitly state the generic formula needed (e.g., $\\log_b x^n = n \\log_b x$).
    - **Step Details**: Extract complex terms into 'stepDetails' for interactive definition.

    PHASE 4: TAXONOMY
    - Identify the 'skillId' from standard taxonomy (e.g. "LOG.LAWS.POWER").

    OUTPUT JSON:
    - transcribed_lines: [string, string, ...] (The full transcription split by logical steps)
    - isCorrect: boolean
    - mistakes: [{ description, box_2d }]
    - explanation: string
    - nextSteps: [string]
    - stepDetails: [{ text, explanation }]
    - topic: string
    - skillId: string
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        temperature: 0, 
        systemInstruction: "You are a Math OCR engine. Transcribe every single line literally. IMPORTANT: You are outputting JSON. You MUST double-escape all backslashes in LaTeX strings (e.g., output '\\\\frac' instead of '\\frac').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            transcribed_lines: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of LaTeX strings. Split chained equations (A=B=C) into separate items ['A=', 'B=', 'C']."
            },
            topic: { type: Type.STRING },
            skillId: { type: Type.STRING, description: "Taxonomy ID like EQ.QUAD.FACTOR" },
            ruleApplications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  generic: { type: Type.STRING },
                  specific: { type: Type.STRING }
                },
                required: ["name", "generic", "specific"]
              }
            },
            mistakes: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                },
                required: ["description"]
              } 
            },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            stepDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["text", "explanation"]
              }
            },
            explanation: { type: Type.STRING },
          },
          required: ["isCorrect", "transcribed_lines", "topic", "mistakes", "nextSteps", "explanation"],
        },
      },
    });

    if (!response.text) throw new Error("No response from AI");
    
    const jsonStr = cleanJson(response.text);
    const parsed = JSON.parse(jsonStr) as any;

    let problemStatement = "";
    if (parsed.transcribed_lines && Array.isArray(parsed.transcribed_lines)) {
      // Clean up the lines to avoid double backslashes if model added them
      const cleanLines = parsed.transcribed_lines.map((line: string) => 
        line.replace(/\\\\$/, '').trim()
      );
      problemStatement = cleanLines.join(' \\\\ ');
    } else if (parsed.problemStatement) {
      problemStatement = parsed.problemStatement;
    }

    if (!problemStatement.trim().startsWith('\\begin')) {
      problemStatement = `\\begin{gather*} ${problemStatement} \\end{gather*}`;
    }

    const finalResponse: SolverResponse = {
      isCorrect: parsed.isCorrect,
      mistakes: parsed.mistakes || [],
      nextSteps: parsed.nextSteps || [],
      explanation: parsed.explanation || "",
      topic: parsed.topic || "Math Problem",
      skillId: parsed.skillId,
      problemStatement: problemStatement,
      approach: parsed.approach || "",
      ruleApplications: parsed.ruleApplications,
      stepDetails: parsed.stepDetails
    };

    return finalResponse;
  } catch (error) {
    console.error("Solver Error:", error);
    throw new Error("Could not analyze image. Please try again.");
  }
};

export const solveExerciseFromText = async (latex: string): Promise<SolverResponse> => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    You are an expert Mathematics Tutor.
    The user has manually edited/transcribed a math problem and its solution steps in LaTeX.
    
    INPUT LATEX:
    ${latex}

    TASK:
    1. **Analyze**: Understand the math steps provided.
    2. **Verify**: Check if the logic and calculations are correct from start to finish.
    3. **Mistakes**: 
       - If there is a mathematical error, set isCorrect=false and identify it.
       - If steps are valid but incomplete, it may be isCorrect=true unless the final statement is wrong.
    4. **Feedback**: Provide an explanation and next steps.

    OUTPUT JSON (strict schema):
    - isCorrect: boolean
    - mistakes: [{ description }] (Note: No box_2d needed for text input)
    - explanation: string
    - nextSteps: [string]
    - stepDetails: [{ text, explanation }]
    - topic: string
    - skillId: string
    - problemStatement: string (Return the cleaned up/formatted LaTeX of the input)
    - ruleApplications: [{ name, generic, specific }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0,
        systemInstruction: "You are a JSON generator. You MUST double-escape all backslashes in LaTeX strings (e.g., output '\\\\frac' instead of '\\frac').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            topic: { type: Type.STRING },
            skillId: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            ruleApplications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  generic: { type: Type.STRING },
                  specific: { type: Type.STRING }
                },
                required: ["name", "generic", "specific"]
              }
            },
            mistakes: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING }
                },
                required: ["description"]
              } 
            },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            stepDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["text", "explanation"]
              }
            },
            explanation: { type: Type.STRING },
          },
          required: ["isCorrect", "topic", "mistakes", "nextSteps", "explanation"],
        },
      },
    });

    if (!response.text) throw new Error("No response from AI");
    
    const jsonStr = cleanJson(response.text);
    const parsed = JSON.parse(jsonStr) as any;

    let problemStatement = parsed.problemStatement || latex;
    if (!problemStatement.trim().startsWith('\\begin')) {
      problemStatement = `\\begin{gather*} ${problemStatement} \\end{gather*}`;
    }

    return {
      isCorrect: parsed.isCorrect,
      mistakes: parsed.mistakes || [],
      nextSteps: parsed.nextSteps || [],
      explanation: parsed.explanation || "",
      topic: parsed.topic || "Math Problem",
      skillId: parsed.skillId,
      problemStatement: problemStatement,
      approach: "",
      ruleApplications: parsed.ruleApplications,
      stepDetails: parsed.stepDetails
    };

  } catch (error) {
    console.error("Text Solver Error:", error);
    throw new Error("Could not analyze the text.");
  }
};

export const analyzeMistakeCorrection = async (problem: string, studentWork: string): Promise<{
  isCorrect: boolean;
  correction: string;
  explanation: string;
  skillId: string;
}> => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    You are an expert Math Tutor.
    The user has manually edited a math problem and their work to fix a previous mistake (or transcription error).
    
    PROBLEM:
    ${problem}
    
    STUDENT WORK:
    ${studentWork}
    
    TASK:
    1. Verify if the "STUDENT WORK" is mathematically correct for the "PROBLEM".
    2. If CORRECT: set isCorrect=true.
    3. If INCORRECT: set isCorrect=false, provide the correct derivation (correction) and explain the error.
    
    OUTPUT JSON:
    - isCorrect: boolean
    - correction: string (LaTeX of the correct steps)
    - explanation: string (Why it is wrong, or "Correct" if correct)
    - skillId: string (Taxonomy ID of the math skill involved)
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0,
        systemInstruction: "You are a JSON generator. You MUST double-escape all backslashes in LaTeX strings (e.g., output '\\\\frac' instead of '\\frac').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            skillId: { type: Type.STRING }
          },
          required: ["isCorrect", "correction", "explanation"]
        }
      }
    });

    if (!response.text) throw new Error("No response");
    const jsonStr = cleanJson(response.text);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Mistake Re-analysis Error:", error);
    throw new Error("Could not analyze correction.");
  }
};

export const analyzeSkills = async (imageFiles: File[]): Promise<AnalysisResponse> => {
  const model = "gemini-3-pro-preview"; 
  const imageParts = await Promise.all(imageFiles.map(f => fileToGenerativePart(f)));
  
  const taxonomyContext = getTaxonomyPromptContext();

  const prompt = `
    Analyze these student math works.
    
    **CONTEXT - MATH SKILL TAXONOMY**:
    Use ONLY the IDs from this list for 'id' and 'skillId' fields:
    ${taxonomyContext}
    
    **ANALYSIS RULES**:
    1. **Logical Transcription**: Read the calculation as a logical flow.
    2. **Merging Logic (Paper Width Fix)**:
       - **CRITICAL**: If a line ends with an operator (+, -, *) or continues onto the next physical line WITHOUT an equality sign, **MERGE IT**.
       - **Example**:
         Image: "2x + \n 5 = 10"
         Transcription: "2x + 5 = 10" (One line)
    3. **Equality Separator**:
       - ONLY separate steps with ' \\\\ ' if there is an equality sign (=) or it is a distinct new equation.
       - Everything between two equality signs belongs on one line.
    4. **Correctness Check**:
       - If the user's calculation is MATHEMATICALLY CORRECT, classify the skill as a **Strength**.
       - **CRITICAL**: Do NOT list correct calculations in 'mistakeExamples'.
    5. **Incorrect Work**: 
       - If a calculation has an error, classify the skill as a **Weakness** and ADD it to 'mistakeExamples'.
    
    **MISTAKE ANALYSIS (Only for errors)**:
    1. **problem**: Write the initial expression/equation.
    2. **studentWork**: Transcribe the **ENTIRE** calculation steps as written by the user.
       - **CRITICAL**: Preserve ALL equality signs (=).
       - **Logical Grouping**: If the user split a single expression across multiple lines (without an =), MERGE them into one line.
       - **Logical Splitting**: Use ' \\\\ ' (double backslash) to break lines **ONLY** after an equality sign (=).
       - Example: "A + B \\n + C = D" -> "A + B + C = \\\\ D"
       - NOTE: In the JSON response string, you must escape the backslashes, so it looks like "A = \\\\\\\\ B = \\\\\\\\ C".
    3. Highlight the specific error part within studentWork if possible, but prioritize full transcription.
    
    **STRENGTHS & WEAKNESSES**:
    Return structured objects. 'id' MUST be a valid Taxonomy ID.

    **FORMATTING RULES**:
    - Equations for 'problem' and 'correction' fields: Use raw LaTeX (e.g. \\frac{1}{2}).
    - Explanations (mistakeExplanation, explanation, recommendations): Use mixed text. **YOU MUST WRAP ALL MATH EXPRESSIONS IN SINGLE DOLLAR SIGNS ($)**.
      - Incorrect: "Multiplying 2 by x gives 2x"
      - Correct: "Multiplying $2$ by $x$ gives $2x$"
    
    OUTPUT JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        temperature: 0,
        systemInstruction: "You are a JSON generator. You MUST double-escape all backslashes in LaTeX strings (e.g., output '\\\\frac' instead of '\\frac').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Valid Taxonomy ID" },
                  name: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "name", "explanation"]
              } 
            },
            weaknesses: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Valid Taxonomy ID" },
                  name: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "name", "explanation"]
              } 
            },
            topicsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedSkillLevel: { type: Type.NUMBER },
            mistakeExamples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  problem: { type: Type.STRING },
                  studentWork: { type: Type.STRING },
                  mistakeExplanation: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  skillId: { type: Type.STRING }
                },
                required: ["problem", "studentWork", "mistakeExplanation", "correction"]
              }
            }
          },
          required: ["strengths", "weaknesses", "topicsIdentified", "recommendations", "estimatedSkillLevel", "mistakeExamples"],
        },
      },
    });

    if (!response.text) throw new Error("No response from AI");
    
    const jsonStr = cleanJson(response.text);
    const result = JSON.parse(jsonStr) as AnalysisResponse;

    if (result.mistakeExamples) {
        result.mistakeExamples = result.mistakeExamples.map((ex, idx) => {
            let work = ex.studentWork;
            if (work && work.includes('\\\\') && !work.trim().startsWith('\\begin')) {
                work = `\\begin{gather*} ${work} \\end{gather*}`;
            }
            return { ...ex, studentWork: work, id: `mistake-${Date.now()}-${idx}` };
        });
    }

    return result;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Could not analyze skills. Please try again.");
  }
};

export const generatePractice = async (focusArea: string): Promise<PracticeGenResponse> => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    You are an expert Math Teacher.
    Generate 3 distinct practice problems for a student who needs help with: "${focusArea}".
    
    REQUIREMENTS:
    1. Create problems that directly address the weaknesses implied by the focus area.
    2. Vary the difficulty slightly (e.g., one easy, one medium, one harder).
    3. Ensure answers are clear and concise.
    4. Provide a helpful explanation for the solution.
    
    OUTPUT JSON:
    - problems: Array of problem objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.5,
        systemInstruction: "You are a JSON generator. You MUST double-escape all backslashes in LaTeX strings (e.g., output '\\\\frac' instead of '\\frac'). Output valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                  topic: { type: Type.STRING },
                  skillId: { type: Type.STRING }
                },
                required: ["question", "correctAnswer", "explanation", "difficulty", "topic"]
              }
            }
          },
          required: ["problems"]
        }
      },
    });

    if (!response.text) throw new Error("No response from AI");
    
    const jsonStr = cleanJson(response.text);
    return JSON.parse(jsonStr) as PracticeGenResponse;

  } catch (error) {
    console.error("Practice Generation Error:", error);
    throw new Error("Could not generate practice problems.");
  }
};
