import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Send,
  Sparkles,
  BookOpen,
  FileText,
  History,
  HelpCircle,
  Code,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Cpu,
  Plus,
  Loader2,
  Trash2,
  X,
  Dna
} from "lucide-react";
import { ChatMessage, ChatHistorySession, StudyMaterial } from "../types";

interface AIChatProps {
  onTriggerPrompt?: string;
  onTriggerCategory?: string;
  onClearTrigger?: () => void;
  studyMaterials?: StudyMaterial[];
}

export default function AIChat({ onTriggerPrompt, onTriggerCategory, onClearTrigger, studyMaterials }: AIChatProps) {
  // Chat core state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-msg",
      sender: "assistant",
      text: "### Welcome to CollegeGPT! 🚀\n\nI am your campus copilot for Srinix College Of Engineering. I am ready to help you with your coding, assignments, attendance, notices, and events.\n\nUse the panel below or the sidebar to ask questions about your coursework. What are we conquering today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "general"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");

  // Chat history state
  const [historySessions, setHistorySessions] = useState<ChatHistorySession[]>([
    { id: "h-1", title: "AI Neural Network Prep", lastMessageText: "Transformer attention breakdown...", timestamp: "10:14 AM", messagesCount: 6 },
    { id: "h-2", title: "NVIDIA Resume Critique", lastMessageText: "Include CUDA project details...", timestamp: "Yesterday", messagesCount: 4 },
    { id: "h-3", title: "Distributed Consensus Raft", lastMessageText: "Study plan successfully created...", timestamp: "July 08", messagesCount: 8 }
  ]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // PDF Summary and Quiz state
  const [showPdfParser, setShowPdfParser] = useState(false);
  const [pdfFilename, setPdfFilename] = useState("AI_Syllabus_v2.pdf");
  const [pdfTextContent, setPdfTextContent] = useState(
    `Cyber-Tech University Syllabus - Advanced Artificial Intelligence\n\nObjective: Learn deep generative models, transformers, and neural network reinforcement. Unit 1 covers linear regression, activation gradients, and cost matrices. Unit 2 details self-attention weights, query-key-value products, and positional encoding vectors. Unit 3 spans policy gradient, rewards, Q-learning, and PPO alignment. Unit 4 focuses on stable diffusion, latent dimensions, and denoising math.`
  );
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [pdfReport, setPdfReport] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [scoreReport, setScoreReport] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: "general", label: "General Chat", desc: "Open assistance" },
    { id: "faq", label: "University FAQs", desc: "Dues, exams, guidelines" },
    { id: "explain_subject", label: "Subject Deep-Dive", desc: "Analogies & code" },
    { id: "study_plan", label: "Roadmap Designer", desc: "Day-by-day plans" },
    { id: "mcq", label: "MCQ Quiz Core", desc: "Challenge questions" },
    { id: "interview", label: "Recruiter Prep", desc: "Tough tech interviews" },
    { id: "coding", label: "Coding Sandbox", desc: "Algorithms & complexity" },
    { id: "placement", label: "Careers Advisor", desc: "Resume & job readiness" },
    { id: "syllabus", label: "Syllabus Explainer", desc: "Unit breakdowns" },
    { id: "timetable", label: "Timetable Planner", desc: "High-yield scheduling" }
  ];

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle outside triggers (e.g., clicking dashboard shortcut buttons)
  useEffect(() => {
    if (onTriggerPrompt) {
      if (onTriggerPrompt.startsWith("Summarize the document: ")) {
        const docTitle = onTriggerPrompt.replace("Summarize the document: ", "");
        const matchedDoc = studyMaterials?.find(m => m.title === docTitle);
        if (matchedDoc) {
          setShowPdfParser(true);
          setPdfFilename(matchedDoc.title);
          setPdfTextContent(matchedDoc.content || `Subject material for ${matchedDoc.title}.\nPublished on ${matchedDoc.date}.\nSubject: ${matchedDoc.subject}`);
        } else {
          setShowPdfParser(true);
          setPdfFilename(docTitle);
          setPdfTextContent(`Simulation file study material placeholder for "${docTitle}". Please enter or paste actual study text content below to analyze with Gemini.`);
        }
      } else {
        setActiveCategory(onTriggerCategory || "general");
        handleSendMessage(onTriggerPrompt, onTriggerCategory || "general");
      }
      if (onClearTrigger) onClearTrigger();
    }
  }, [onTriggerPrompt, onTriggerCategory, studyMaterials]);

  const handleSendMessage = async (textToSend?: string, categoryToSend?: string) => {
    const finalMsg = textToSend || inputText;
    if (!finalMsg.trim()) return;

    if (!textToSend) setInputText("");
    const currentCat = categoryToSend || activeCategory;

    // Append User Message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: finalMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: currentCat
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: finalMsg,
          history: messages.slice(-8), // send last 8 messages for context
          category: currentCat,
          model: "nvidia/nemotron-3-ultra-550b-a55b:free",
          provider: "openrouter",
          stream: true
        })
      });

      const assistantId = `ai-${Date.now()}`;
      const assistantTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const helperMessage: ChatMessage = {
        id: assistantId,
        sender: "assistant",
        text: "",
        timestamp: assistantTimestamp,
        category: currentCat
      };

      setMessages(prev => [...prev, helperMessage]);

      const contentType = response.headers.get("content-type") || "";
      let renderedText = "";

      if (contentType.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Streaming response body is not available.");
        }

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const blocks = chunk.split("\n\n").filter(Boolean);

          for (const block of blocks) {
            const line = block.split("\n").find(line => line.startsWith("data:"));
            if (!line) continue;

            const payload = line.replace(/^data:\s*/, "").trim();
            if (!payload || payload === "[DONE]") continue;

            const parsed = JSON.parse(payload);
            if (parsed.done) {
              renderedText = parsed.text || renderedText;
              setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, text: renderedText } : msg));
              continue;
            }

            if (parsed.text) {
              renderedText += parsed.text;
              setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, text: renderedText } : msg));
            }
          }
        }
      } else {
        const data = await response.json();
        renderedText = data.text || data.error || "Connection failed. Please verify system node configuration.";
        setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, text: renderedText } : msg));
      }

      // Update history summary
      if (messages.length === 1) {
        const newSession: ChatHistorySession = {
          id: `h-${Date.now()}`,
          title: finalMsg.slice(0, 24) + "...",
          lastMessageText: renderedText.slice(0, 30) + "...",
          timestamp: "Just Now",
          messagesCount: 2
        };
        setHistorySessions(prev => [newSession, ...prev]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        sender: "assistant",
        text: "🚨 **System Timeout**: Secure connection to CollegeGPT Intelligence Core could not be validated. Using fallback local templates.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: currentCat
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLoadHistorySession = (session: ChatHistorySession) => {
    setActiveHistoryId(session.id);
    // Populate mock historic messages
    setMessages([
      {
        id: "hist-0",
        sender: "user",
        text: `Tell me about my previous research topic on: ${session.title}`,
        timestamp: "10:10 AM"
      },
      {
        id: "hist-1",
        sender: "assistant",
        text: `### 🌐 Session Restored: ${session.title}\n\nWe were reviewing consensus states and performance indicators. Let's resume! Ask me any follow-up questions regarding development bottlenecks or design charts.`,
        timestamp: "10:12 AM"
      }
    ]);
  };

  const handleCreateNewChat = () => {
    setActiveHistoryId(null);
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "assistant",
        text: "### New Session Created 🪐\n\nI have flushed the transient cache. Tell me what subject or query we are processing next.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleAnalyzePDF = async () => {
    if (!pdfTextContent.trim()) return;
    setIsAnalyzingPdf(true);
    setScoreReport(null);
    setSelectedAnswers({});

    try {
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: pdfFilename,
          fileContent: pdfTextContent
        })
      });
      const data = await res.json();
      setPdfReport(data);
    } catch (e) {
      console.error(e);
      // Fallback
      setPdfReport({
        summary: "Neural network backpropagation optimization walkthrough.",
        keyTakeaways: [
          "Gradients cascade backward using the mathematical chain rule.",
          "Weight optimizations adjust learning parameter speeds."
        ],
        estimatedStudyTime: "2 Hours",
        recommendedPrerequisites: "Pre-calculus algebra",
        generatedMCQs: [
          {
            q: "What rule of calculus is backpropagation built upon?",
            options: ["Quotient Rule", "Chain Rule", "Product Rule", "L'Hopital's Rule"],
            correct: 1
          }
        ]
      });
    } finally {
      setIsAnalyzingPdf(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!pdfReport || !pdfReport.generatedMCQs) return;
    let correctCount = 0;
    const total = pdfReport.generatedMCQs.length;

    pdfReport.generatedMCQs.forEach((mcq: any, idx: number) => {
      if (selectedAnswers[idx] === mcq.correct) {
        correctCount++;
      }
    });

    setScoreReport(`### Quiz Assessment Submitted!\nScore: **${correctCount} / ${total}** (${Math.round((correctCount / total) * 100)}% accuracy)`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[500px]">

      {/* LEFT COLUMN: History Draw & Categories (4 columns) */}
      <div className="xl:col-span-3 flex flex-col gap-4 max-h-full overflow-y-auto">

        {/* New Session Panel */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-4">
          <button
            onClick={handleCreateNewChat}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/10"
          >
            <Plus className="w-4 h-4" /> Initialize Fresh Node
          </button>

          {/* Toggle PDF Panel */}
          <button
            onClick={() => setShowPdfParser(!showPdfParser)}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider border flex items-center justify-center gap-2 transition ${showPdfParser
              ? "bg-amber-500/10 border-amber-400/30 text-amber-400"
              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
          >
            <FileText className="w-4 h-4" />
            {showPdfParser ? "Close PDF Analyzer" : "Launch PDF Analyzer"}
          </button>
        </div>

        {/* Categories Grid */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
          <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest pb-1 border-b border-white/10">
            Active Core Models
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left p-2 rounded-xl transition flex items-start gap-2.5 border ${activeCategory === cat.id
                  ? "bg-white/10 border-white/15 text-white shadow-lg shadow-indigo-500/5"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}
              >
                <div className="p-1 rounded-lg bg-white/5 mt-0.5 shrink-0">
                  {cat.id === "faq" && <HelpCircle className="w-3.5 h-3.5" />}
                  {cat.id === "explain_subject" && <BookOpen className="w-3.5 h-3.5" />}
                  {cat.id === "coding" && <Code className="w-3.5 h-3.5" />}
                  {cat.id === "placement" && <Briefcase className="w-3.5 h-3.5" />}
                  {cat.id !== "faq" && cat.id !== "explain_subject" && cat.id !== "coding" && cat.id !== "placement" && <Sparkles className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold">{cat.label}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">{cat.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Historic Sessions list */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400 uppercase tracking-widest pb-1 border-b border-white/10">
              <History className="w-3.5 h-3.5" /> Recent Telemetry
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {historySessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleLoadHistorySession(session)}
                  className={`w-full text-left p-2 rounded-xl transition border text-xs flex justify-between gap-2 ${activeHistoryId === session.id
                    ? "bg-purple-500/10 border-purple-400/30 text-purple-400"
                    : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                    }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{session.title}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{session.lastMessageText}</div>
                  </div>
                  <span className="text-[9px] text-slate-600 font-mono shrink-0 pt-0.5">{session.timestamp}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setHistorySessions([])}
            className="text-[10px] font-mono text-red-400/70 hover:text-red-400 text-center w-full mt-4 flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Purge Memory Logs
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: Active Chat Console / PDF Analyzer (8 columns) */}
      <div className={`xl:col-span-9 flex flex-col glass-panel border border-white/10 rounded-3xl overflow-hidden relative ${showPdfParser ? "grid grid-cols-1 lg:grid-cols-2" : ""}`}>

        {/* Sub panel: Chat Core */}
        <div className="flex flex-col h-full border-r border-white/10">
          {/* Chat Header */}
          <div className="p-4 bg-slate-950/40 border-b border-white/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <div>
                <span className="text-xs font-mono font-bold text-slate-100">COLLEGEGPT_CORE v3.5</span>
                <p className="text-[10px] text-slate-400">Node: Active & Encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono uppercase">
                {activeCategory} Mode
              </span>
            </div>
          </div>

          {/* Chat scrolling viewport */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.sender === "user"
                  ? "bg-indigo-500/10 border-indigo-400/20 text-indigo-400"
                  : "bg-purple-500/10 border-purple-400/20 text-purple-400"
                  }`}>
                  {msg.sender === "user" ? "U" : <Cpu className="w-4 h-4 animate-pulse" />}
                </div>

                <div className="space-y-1">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border whitespace-pre-line ${msg.sender === "user"
                    ? "bg-indigo-500/5 border-indigo-400/20 text-indigo-200"
                    : "bg-white/5 border-white/5 text-slate-200"
                    }`}>
                    {msg.text}
                  </div>
                  <div className={`text-[9px] text-slate-500 font-mono ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Pulsating Typing Animation */}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-400/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4 animate-pulse" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Helper tray */}
          <div className="px-4 py-2 border-t border-white/10 flex gap-2 overflow-x-auto whitespace-nowrap bg-black/10 shrink-0">
            <button
              onClick={() => handleSendMessage("Are mid-semester examination schedules released?", "faq")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 transition"
            >
              Exams FAQ?
            </button>
            <button
              onClick={() => handleSendMessage("Create a detailed 7-day study timeline for my Artificial Intelligence exam next week.", "study_plan")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 transition"
            >
              Syllabus Study Plan
            </button>
            <button
              onClick={() => handleSendMessage("Generate 4 multiple choice questions on compiler lexical parsing.", "mcq")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 transition"
            >
              Parse MCQs
            </button>
            <button
              onClick={() => handleSendMessage("Write an optimized algorithm to find the peak element in an array.", "coding")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 transition"
            >
              Two-Sum Coding
            </button>
          </div>

          {/* Input field */}
          <div className="p-4 bg-slate-950/40 border-t border-white/10 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder={`Query PANDA AI (${activeCategory} model is active)...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl glass-input text-sm text-slate-100"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition text-white flex items-center justify-center shrink-0 disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sub panel: PDF Parser Console (Visible on split toggle) */}
        {showPdfParser && (
          <div className="flex flex-col h-full bg-[#05070c] max-h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 bg-[#0a0c16] border-b border-white/5 flex justify-between items-center shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-400">PDF SUMMARIZER & QUIZ ENGINE</span>
              </div>
              <button onClick={() => setShowPdfParser(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-grow">
              {/* Document Source select */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">Select Study Document</label>
                  {studyMaterials && studyMaterials.length > 0 && (
                    <span className="text-[10px] text-indigo-400 font-bold font-mono">
                      {studyMaterials.length} SHARED FILES
                    </span>
                  )}
                </div>
                {studyMaterials && studyMaterials.length > 0 ? (
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setPdfFilename("");
                        setPdfTextContent("");
                      } else {
                        const matchedDoc = studyMaterials.find(m => m.id === val);
                        if (matchedDoc) {
                          setPdfFilename(matchedDoc.title);
                          setPdfTextContent(matchedDoc.content || `Simulation study material content for: ${matchedDoc.title}\nSubject: ${matchedDoc.subject}\nPublished Date: ${matchedDoc.date}`);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#111322] border border-white/10 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose from shared materials --</option>
                    {studyMaterials.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title} ({doc.subject})
                      </option>
                    ))}
                    <option value="custom">-- Create Custom/Paste Text --</option>
                  </select>
                ) : (
                  <p className="text-[10px] text-slate-500 font-mono">No active shared files. Feel free to paste text below.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">Document Filename</label>
                <input
                  type="text"
                  value={pdfFilename}
                  onChange={(e) => setPdfFilename(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  placeholder="Enter document filename (e.g. quantum-notes.pdf)"
                />
              </div>

              {/* Text Input area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">Syllabus Text / PDF content paste</label>
                  <span className="text-[10px] text-slate-500 font-mono">Simulate Upload</span>
                </div>
                <textarea
                  rows={4}
                  value={pdfTextContent}
                  onChange={(e) => setPdfTextContent(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-slate-200 font-sans leading-relaxed resize-none"
                  placeholder="Paste research contents, exam syllabus text, or lab manuals here..."
                />
              </div>

              {/* Action button */}
              <button
                onClick={handleAnalyzePDF}
                disabled={isAnalyzingPdf}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-amber-500/10"
              >
                {isAnalyzingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Document Core...
                  </>
                ) : (
                  <>
                    <Dna className="w-4 h-4" /> Parse & Generate AI Review
                  </>
                )}
              </button>

              {/* Parsed Output Report */}
              {pdfReport && (
                <div className="space-y-5 pt-4 border-t border-white/5">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">AI SUMMARY REPORT</div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{pdfReport.summary}</p>

                    <div className="text-xs font-mono font-semibold text-slate-400 mt-3 uppercase tracking-wider">Estimated Study Time</div>
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-amber-400 w-fit">
                      {pdfReport.estimatedStudyTime}
                    </div>

                    <div className="text-xs font-mono font-semibold text-slate-400 mt-3 uppercase tracking-wider">Key Takeaways</div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 leading-relaxed font-sans">
                      {pdfReport.keyTakeaways?.map((take: string, i: number) => (
                        <li key={i}>{take}</li>
                      ))}
                    </ul>
                  </div>

                  {/* MCQ generator section */}
                  {pdfReport.generatedMCQs && pdfReport.generatedMCQs.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">INTERACTIVE GENERATED MCQS</div>

                      {pdfReport.generatedMCQs.map((mcq: any, mcqIdx: number) => (
                        <div key={mcqIdx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                          <div className="text-xs font-semibold text-slate-200">Q{mcqIdx + 1}: {mcq.q}</div>
                          <div className="grid grid-cols-1 gap-2 pt-2">
                            {mcq.options.map((opt: string, optIdx: number) => {
                              const isSelected = selectedAnswers[mcqIdx] === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectAnswer(mcqIdx, optIdx)}
                                  className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition border ${isSelected
                                    ? "bg-purple-500/10 border-purple-400/50 text-purple-300 font-semibold"
                                    : "bg-black/20 border-white/5 text-slate-400 hover:bg-black/30"
                                    }`}
                                >
                                  {optIdx === 0 && "A. "}
                                  {optIdx === 1 && "B. "}
                                  {optIdx === 2 && "C. "}
                                  {optIdx === 3 && "D. "}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {scoreReport ? (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-mono whitespace-pre-line">
                          {scoreReport}
                        </div>
                      ) : (
                        <button
                          onClick={handleSubmitQuiz}
                          className="w-full py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-white font-mono text-xs font-bold uppercase transition"
                        >
                          Grade Quiz Responses
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
