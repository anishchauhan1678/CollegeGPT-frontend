import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { OpenAI } from "openai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// ============================================================================
// 🤖 CUSTOM AI CHAT MODEL INTEGRATION CONFIGURATION
// Edit these three fields to easily connect your custom AI provider (DeepSeek, OpenAI, etc.)
// ============================================================================
const DEFAULT_AI_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

const CUSTOM_AI_CONFIG = {
  MODEL_NAME: DEFAULT_AI_MODEL, // E.g., "deepseek-chat", "gpt-4o", "meta-llama/llama-3.1-405b-instruct"
  API_KEY: process.env.OPENROUTER_API_KEY || "", // E.g., your Gemini API Key or third-party key
  BASE_URL: "https://openrouter.ai/api/v1", // E.g., "https://api.deepseek.com/v1", "https://openrouter.ai/api/v1" or leave blank for Google Gemini
};

// Initialize NVIDIA NIM API client (Direct integration)
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
let nvidiaClient: OpenAI | null = null;

function getNvidiaClient(): OpenAI | null {
  if (!nvidiaClient && nvidiaApiKey) {
    console.log("Initializing NVIDIA NIM Client with high-performance model...");
    nvidiaClient = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: nvidiaApiKey,
    });
  }
  return nvidiaClient;
}

// Initialize OpenRouter / OpenAI client
const openRouterKey = process.env.OPENROUTER_API_KEY;
let openAiClient: OpenAI | null = null;

function getOpenRouterClient(): OpenAI | null {
  if (!openAiClient && openRouterKey) {
    console.log("Initializing OpenRouter Client for nvidia/nemotron-3-ultra-550b-a55b:free...");
    openAiClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterKey,
    });
  }
  return openAiClient;
}

// Initialize Google Gen AI (used strictly as an emulator for NVIDIA AI if direct keys are absent)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const activeKey = CUSTOM_AI_CONFIG.API_KEY || apiKey;
    if (!activeKey && !openRouterKey && !nvidiaApiKey) {
      console.warn("WARNING: Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is set. AI features will fallback to smart template responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: activeKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Global AI Content Generation Hub powered by CUSTOM_AI_CONFIG or fallback providers
async function generateAIContent(options: {
  systemInstruction?: string;
  contents: string | any[];
  responseMimeType?: string;
  model?: string;
  provider?: string;
}): Promise<string> {
  // 1. Check if user configured a Custom AI Provider with a custom BASE_URL
  const preferredModel = options.model || DEFAULT_AI_MODEL;
  const customApiKey = CUSTOM_AI_CONFIG.API_KEY || process.env.GEMINI_API_KEY || apiKey;
  if (CUSTOM_AI_CONFIG.BASE_URL && customApiKey && customApiKey !== "") {
    try {
      console.log(`Connecting to custom AI provider: ${CUSTOM_AI_CONFIG.BASE_URL} with model: ${preferredModel}`);
      const customOpenAI = new OpenAI({
        baseURL: CUSTOM_AI_CONFIG.BASE_URL,
        apiKey: customApiKey,
      });

      const messages: any[] = [];
      if (options.systemInstruction) {
        messages.push({
          role: "system",
          content: options.systemInstruction
        });
      }

      if (typeof options.contents === "string") {
        messages.push({
          role: "user",
          content: options.contents
        });
      } else {
        for (const item of options.contents) {
          messages.push({
            role: item.role === "user" ? "user" : "assistant",
            content: item.parts?.[0]?.text || ""
          });
        }
      }

      const params: any = {
        model: preferredModel,
        messages: messages,
        temperature: 0.7,
      };

      if (options.responseMimeType === "application/json") {
        params.response_format = { type: "json_object" };
      }

      const completion = await customOpenAI.chat.completions.create(params);
      return completion.choices[0]?.message?.content || "";
    } catch (customError: any) {
      console.error("Custom AI provider integration failed, falling back to other layers...", customError);
    }
  }

  // 2. Try Direct NVIDIA NIM API
  const nvidia = getNvidiaClient();
  if (nvidia) {
    try {
      const messages: any[] = [];
      const baseSystem = "You are the advanced NVIDIA Nemotron-3 Ultra 550B model developed by NVIDIA. Deliver highly accurate, high-performance structured answers.";
      const fullSystem = options.systemInstruction
        ? `${baseSystem}\n\n${options.systemInstruction}`
        : baseSystem;

      messages.push({
        role: "system",
        content: fullSystem
      });

      if (typeof options.contents === "string") {
        messages.push({
          role: "user",
          content: options.contents
        });
      } else {
        for (const item of options.contents) {
          messages.push({
            role: item.role === "user" ? "user" : "assistant",
            content: item.parts?.[0]?.text || ""
          });
        }
      }

      const completion = await nvidia.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: messages,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (nvidiaError: any) {
      console.error("Direct NVIDIA NIM API Failed, falling back to OpenRouter...", nvidiaError);
    }
  }

  // 3. Try OpenRouter (NVIDIA Nemotron Free)
  const openRouter = getOpenRouterClient();
  if (openRouter) {
    try {
      const messages: any[] = [];
      if (options.systemInstruction) {
        messages.push({
          role: "system",
          content: options.systemInstruction
        });
      }

      if (typeof options.contents === "string") {
        messages.push({
          role: "user",
          content: options.contents
        });
      } else {
        for (const item of options.contents) {
          messages.push({
            role: item.role === "user" ? "user" : "assistant",
            content: item.parts?.[0]?.text || ""
          });
        }
      }

      const completion = await openRouter.chat.completions.create({
        model: preferredModel,
        messages: messages,
        extra_body: {
          reasoning: {
            enabled: true
          }
        }
      } as any);

      return completion.choices[0]?.message?.content || "";
    } catch (openRouterError: any) {
      console.error("OpenRouter NVIDIA API Failed, falling back to emulated model...", openRouterError);
    }
  }

  // 4. Default / Fallback to Google Gemini API (supporting custom keys if set)
  const gemini = getAiClient();
  const contentsParam = typeof options.contents === "string"
    ? [{ role: "user", parts: [{ text: options.contents }] }]
    : options.contents;

  const baseEmulationPrompt = "You are the XYZ CollegeGPT engine. Emulate CollegeGPT's conversational tone, intelligence, and structures perfectly. Always refer to yourself as Powered by CollegeGPT AI Core.";
  const combinedSystem = options.systemInstruction
    ? `${baseEmulationPrompt}\n\n${options.systemInstruction}`
    : baseEmulationPrompt;

  const targetModel = (CUSTOM_AI_CONFIG.MODEL_NAME && !CUSTOM_AI_CONFIG.BASE_URL)
    ? CUSTOM_AI_CONFIG.MODEL_NAME
    : "gemini-3.5-flash";

  const response = await gemini.models.generateContent({
    model: targetModel,
    contents: contentsParam,
    config: {
      systemInstruction: combinedSystem,
      responseMimeType: options.responseMimeType,
      temperature: 0.7,
    }
  });

  return response.text || "";
}

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Base API endpoints
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString(), aiEnabled: !!apiKey || !!openRouterKey || !!nvidiaApiKey });
});

/**
 * AI Chatbot Endpoint
 */
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [], category = "general", model = DEFAULT_AI_MODEL, provider = "openrouter", stream = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Set up high-performance custom system instruction depending on user's query context
    let systemInstruction = `You are CollegeGPT, a specialized and friendly AI assistant for students of XYZ Engineering College.

Please strictly follow these Rules and Guidelines in your behavior:
- Give short answers.
- Explain simply.
- Help with coding.
- Help with assignments.
- Help with attendance.
- Help with notices.
- Help with events.
- Never refer to yourself as Panda AI or Cyber-Tech. Always refer to yourself as CollegeGPT supporting XYZ Engineering College.

Always reply using clean, beautifully formatted Markdown. Use bold terms, lists, and code blocks where appropriate.`;

    if (category === "faq") {
      systemInstruction += `
Focus specifically on answering XYZ Engineering College FAQs. Common details:
- Placements: Average package is 18 LPA, highest package is 48 LPA, major recruiters: Google, NVIDIA, Stripe, Microsoft.
- Exams: Mid-semesters start on July 20, 2026. Clearing dues by July 15 is mandatory. Passing threshold is 40% combined.
- Attendance: Minimum 75% attendance is strictly required to sit for examinations.
- Grants: R&D student-led IoT and Robotics grant offers up to $5,000.`;
    } else if (category === "explain_subject") {
      systemInstruction += `
You are a brilliant professor at XYZ Engineering College. Explain complex academic subjects, terms, and theories simply with analogies and short answers.`;
    } else if (category === "study_plan") {
      systemInstruction += `
You are an expert academic advisor at XYZ Engineering College. Generate a simple, structured study roadmap for the subject or topic requested. Give short and simple recommendations.`;
    } else if (category === "mcq") {
      systemInstruction += `
Generate 4 highly relevant, simple Multiple Choice Questions (MCQs) on the requested topic for XYZ Engineering College exams.`;
    } else if (category === "interview") {
      systemInstruction += `
You are a tech recruiter. Generate a simple list of 5 interview questions complete with short, simple answers.`;
    } else if (category === "coding") {
      systemInstruction += `
You are an elite coding mentor. Solve coding problems, explain algorithms simply, and write pristine, optimized code. Keep explanations short.`;
    } else if (category === "placement") {
      systemInstruction += `
Provide strategic, simple placement guidelines and resume tips for XYZ Engineering College students.`;
    } else if (category === "syllabus") {
      systemInstruction += `
Explain the core syllabus simply, divided into simple Units, with short notes.`;
    } else if (category === "timetable") {
      systemInstruction += `
Design a simple high-performance study timetable based on the user's weekly goals.`;
    }

    if (!apiKey && !openRouterKey && !nvidiaApiKey) {
      // Return beautiful simulated response if keys are missing
      const simulatedResponses: Record<string, string> = {
        faq: `### 🌐 XYZ Engineering College FAQ
Thank you for asking! Here are the core details regarding **examinations & eligibility** at XYZ Engineering College:
1. **Attendance Requirement**: A minimum of **75% attendance** is mandatory in each registered subject to be eligible to sit for the end-semester exams.
2. **Exams Start Date**: The upcoming mid-semester assessments commence on **July 20, 2026**.
3. **Passing Dues**: All library books and tuition fees must be settled by **July 15, 2026** to release your examination hall ticket.

Would you like me to help you check your active attendance status?`,
        explain_subject: `### 🧠 Subject Deep Dive: Transformer Neural Networks
Transformers are the foundational architecture powering modern Large Language Models like me. Let's break down the mechanics:

*   **Self-Attention Mechanism**: Allows the model to weigh the relevance of different words in a sentence relative to each other, regardless of their position.
*   **Positional Encoding**: Since there is no recurrence (like in LSTMs), we inject a unique positional vector into each word embedding to preserve order.
*   **Encoder-Decoder Stack**:
    *   *Encoder*: Processes input text into rich mathematical context.
    *   *Decoder*: Takes context and auto-regressively predicts subsequent tokens.

**Professor's Analogy:** Think of self-attention as reading a textbook with a highlighter—focusing intensely on related terms even if they are pages apart!`,
        study_plan: `### 📅 High-Performance 7-Day Study Plan
Here is your customized roadmap to master **Distributed Systems Consensus**:

| Day | Topic | Focus Areas | Est. Time |
| :--- | :--- | :--- | :--- |
| **Day 1** | Fundamentals of Consensus | CAP Theorem, FLP Impossibility | 2.5 Hrs |
| **Day 2** | Classical Consensus | Paxos State Machine, Synods | 3.0 Hrs |
| **Day 3** | Modern Consensus | Raft Algorithm, Leader Election | 4.0 Hrs |
| **Day 4** | Practical Implementation | Setting up Apache ZooKeeper or etcd | 3.5 Hrs |
| **Day 5** | Byzantine Faults | PBFT & Proof-of-Work structures | 3.0 Hrs |
| **Day 6** | Testing & Debugging | Simulating network partitions (Jepsen testing) | 4.0 Hrs |
| **Day 7** | Assessment Prep | Mock MCQs and system design scenario practice | 3.0 Hrs |

*💡 Pro-tip: Spend 15 minutes reviewing active flashcards every morning before labs!*`,
        coding: `### 💻 Coding Problem: Optimizing Two-Sum on Sorted Array
Here is the optimal algorithm using a **Two-Pointer** technique:

\`\`\`typescript
function twoSumSorted(numbers: number[], target: number): number[] {
    let left = 0;
    let right = numbers.length - 1;
    
    while (left < right) {
        const currentSum = numbers[left] + numbers[right];
        if (currentSum === target) {
            return [left + 1, right + 1]; // 1-indexed representation
        } else if (currentSum < target) {
            left++; // Need a larger sum
        } else {
            right--; // Need a smaller sum
        }
    }
    return [];
}
\`\`\`

#### ⏱️ Complexity Analysis:
*   **Time Complexity**: $\\mathcal{O}(N)$ where $N$ is the number of elements. We traverse the list at most once.
*   **Space Complexity**: $\\mathcal{O}(1)$ auxiliary space. We only store two integer pointers.`,
        general: `### 🚀 Greetings from CollegeGPT!
I am ready to assist you. Ask me anything about your syllabus, exams, assignments, coding problems, attendance count, or notices for XYZ Engineering College! I am connected to your core campus database and can synthesize fast, simple guidelines for you.`
      };

      const reply = simulatedResponses[category] || simulatedResponses["general"];
      return res.json({ text: reply, simulated: true });
    }

    // Map conversation history into model-friendly contents
    // Ensure the conversation history starts with a "user" turn and strictly alternates roles
    const chatContents: any[] = [];
    for (const h of history) {
      if (!h || !h.text) continue;
      const role = h.sender === "user" ? "user" : "model";
      const last = chatContents[chatContents.length - 1];
      if (last && last.role === role) {
        // Merge consecutive turns of the same role
        last.parts[0].text += "\n\n" + h.text;
      } else {
        // Discard any initial "model" turns before the first "user" turn
        if (chatContents.length > 0 || role === "user") {
          chatContents.push({
            role,
            parts: [{ text: h.text }]
          });
        }
      }
    }

    // Append the current user message safely
    const lastContent = chatContents[chatContents.length - 1];
    if (lastContent && lastContent.role === "user") {
      lastContent.parts[0].text += "\n\n" + message;
    } else {
      chatContents.push({
        role: "user",
        parts: [{ text: message }]
      });
    }

    if (stream && openRouterKey) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      const openRouter = getOpenRouterClient();
      if (!openRouter) {
        res.write("event: error\ndata: {\"error\":\"OpenRouter client is unavailable.\"}\n\n");
        res.end();
        return;
      }

      const streamMessages: any[] = [
        { role: "system", content: systemInstruction },
        ...history
          .filter((h: any) => h && h.text)
          .map((h: any) => ({
            role: h.sender === "user" ? "user" : "assistant",
            content: h.text
          })),
        { role: "user", content: message }
      ];

      let streamedText = "";
      const completion = await openRouter.chat.completions.create({
        model: model || DEFAULT_AI_MODEL,
        messages: streamMessages,
        stream: true,
        extra_body: {
          reasoning: {
            enabled: true
          }
        }
      } as any);

      const completionStream = completion as unknown as AsyncIterable<any>;
      for await (const chunk of completionStream) {
        const delta = chunk?.choices?.[0]?.delta?.content || "";
        if (!delta) continue;
        streamedText += delta;
        res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true, text: streamedText })}\n\n`);
      res.end();
      return;
    }

    const responseText = await generateAIContent({
      systemInstruction,
      contents: chatContents,
      model,
      provider
    });

    res.json({ text: responseText || "I was unable to synthesize a response. Please try again." });

  } catch (error: any) {
    console.error("AI Generation Error in /api/chat:", error);
    res.status(500).json({
      error: "AI Generation failed. Please verify your internet connection or API secrets.",
      details: error.message
    });
  }
});

/**
 * AI PDF Summarizer & Analytics Endpoint
 * Simulates analyzing parsed PDF contents and returns deep insights
 */
app.post("/api/upload-pdf", async (req: Request, res: Response) => {
  try {
    const { filename, fileContent } = req.body;

    if (!fileContent) {
      return res.status(400).json({ error: "File content or parsed text is required." });
    }

    const systemPrompt = `You are a professional academic PDF parser. Analyze the uploaded file text and output a structured, premium JSON payload matching exactly this schema:
{
  "summary": "High-level summary of the file",
  "keyTakeaways": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "estimatedStudyTime": "e.g., 4 Hours",
  "recommendedPrerequisites": "Prerequisites needed to understand this material",
  "generatedMCQs": [
    {
      "q": "Question 1",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}`;

    if (!apiKey && !openRouterKey && !nvidiaApiKey) {
      // Simulate analysis if key is missing
      return res.json({
        summary: `Parsed document '${filename}' focusing on neural network foundations, backpropagation optimization, and stochastic gradient descent math.`,
        keyTakeaways: [
          "Gradient descent is optimized using adaptive learning rates (Adam, RMSProp).",
          "Activation functions introduce non-linearity, allowing deep architectures to map complex decisions.",
          "Vanishing gradients in deep layers can be mitigated via residual shortcut connections."
        ],
        estimatedStudyTime: "3.5 Hours",
        recommendedPrerequisites: "Calculus, Linear Algebra, Fundamentals of Python",
        generatedMCQs: [
          {
            q: "Which activation function is most vulnerable to the vanishing gradient problem?",
            options: ["ReLU", "Sigmoid", "Leaky ReLU", "GELU"],
            correct: 1
          },
          {
            q: "What does the 'momentum' term in optimizer updates primarily help with?",
            options: ["Speeding up loading times", "Escaping local minima & dampening oscillations", "Reducing dataset size", "None of the above"],
            correct: 1
          }
        ],
        simulated: true
      });
    }

    const responseText = await generateAIContent({
      systemInstruction: systemPrompt,
      contents: `Filename: ${filename}\n\nContent:\n${fileContent}`,
      responseMimeType: "application/json",
    });

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(cleanJson || "{}");
    res.json(parsedData);

  } catch (error: any) {
    console.error("PDF Analytics Error:", error);
    res.status(500).json({
      error: "Failed to perform AI analysis on the document.",
      details: error.message
    });
  }
});

/**
 * AI Attendance Analyzer Endpoint
 * Parses raw text descriptions of daily student attendance and calculates percentages
 */
app.post("/api/parse-attendance-ai", async (req: Request, res: Response) => {
  try {
    const { rawText, students = [] } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: "Attendance text description is required." });
    }

    const systemPrompt = `You are the Mr.Anish Generative Panda Ai Attendance Compiler.
Your job is to read raw daily class logs/descriptions and match them against the students in the database.
Match names or roll numbers accurately.

Current active students in database:
${JSON.stringify(students, null, 2)}

For each student mentioned in the text:
1. Determine if they are "present" or "absent".
   - If they are mentioned as present, attending, here, or answering questions, mark them as "present".
   - If they are mentioned as absent, missing, late, skipped, or not here, mark them as "absent".
2. Calculate their new attendance percentage:
   - For "present": increase their current attendance slightly (e.g., current_percentage * 0.95 + 5.0, capped at 100%).
   - For "absent": decrease their current attendance (e.g., current_percentage * 0.95, rounded to 1 decimal).
3. Provide a brief "reason" explaining your decision (e.g., "Mentioned as present in the class log").

Return EXACTLY a JSON payload with this schema (no other text, no markdown backticks outside JSON):
{
  "results": [
    {
      "roll": "STUDENT_ROLL_NUMBER",
      "name": "STUDENT_NAME",
      "status": "present" | "absent",
      "reason": "Brief explanation of analysis",
      "calculatedAttendance": 92.4
    }
  ]
}`;

    if (!apiKey && !openRouterKey && !nvidiaApiKey) {
      // Smart Fallback Parser if API Key is not set
      const results: any[] = [];
      const lowerText = rawText.toLowerCase();

      students.forEach((s: any) => {
        const nameParts = s.name.toLowerCase().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        const matchesName = lowerText.includes(s.name.toLowerCase()) ||
          lowerText.includes(firstName) ||
          lowerText.includes(s.roll.toLowerCase());

        if (matchesName) {
          // Determine status based on absent-keywords near the name/roll
          let status: "present" | "absent" = "present";
          const absentKeywords = ["absent", "missed", "not here", "skipped", "late", "away", "sick"];

          // Check if any absent keyword is close to the student's name in the text
          for (const key of absentKeywords) {
            if (lowerText.includes(key)) {
              const studentIdx = lowerText.indexOf(firstName);
              const keyIdx = lowerText.indexOf(key);
              // If the keyword is within 40 characters of the name
              if (Math.abs(studentIdx - keyIdx) < 40) {
                status = "absent";
                break;
              }
            }
          }

          const currentAtt = s.attendance;
          const calculatedAttendance = status === "present"
            ? parseFloat(Math.min(100, currentAtt * 0.96 + 4).toFixed(1))
            : parseFloat(Math.max(0, currentAtt * 0.96).toFixed(1));

          results.push({
            roll: s.roll,
            name: s.name,
            status,
            reason: `Identified as ${status} via Mr.Anish Generative Panda Ai Local Parser matching word pattern.`,
            calculatedAttendance
          });
        }
      });

      return res.json({ results, simulated: true });
    }

    const responseText = await generateAIContent({
      systemInstruction: systemPrompt,
      contents: `Raw Log Text:\n${rawText}`,
      responseMimeType: "application/json",
    });

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(cleanJson || '{"results": []}');
    res.json(parsedData);

  } catch (error: any) {
    console.error("AI Attendance Error:", error);
    res.status(500).json({
      error: "Failed to parse attendance using Mr.Anish Generative Panda Ai AI Bot.",
      details: error.message
    });
  }
});

/**
 * AI Campus Analytics for Admin Dashboard
 */
app.post("/api/ai-analytics", async (req: Request, res: Response) => {
  try {
    const { stats } = req.body;

    const systemPrompt = `You are Mr.Anish Generative Panda Ai Dean's Analyst. Look at these college stats and synthesize a futuristic, high-performance executive analysis including academic trends, strategic recommendations, and event readiness notes. Output your response as a clean, styled markdown document with a professional corporate-cyber tone.`;

    if (!apiKey && !openRouterKey && !nvidiaApiKey) {
      return res.json({
        report: `### 📊 Mr.Anish Generative Panda Ai AI Campus Analytics Report

Based on active parameters (Students: **1,690**, Average Attendance: **85.4%**, Placement Success: **82%**):

#### ⚡ Core Trends Identified:
*   **AI & CS Dominated Engagement**: Over 65% of active forum and chatbot discussions revolve around AI architectures (Transformers) and NVIDIA internship placement drives.
*   **Attendance Resilience**: Standard attendance is healthy at 85.4%, but drops to 74% on Fridays due to student hackathon planning.

#### 🛠️ Strategic Interventions:
1.  **Introduce Hybrid Friday Labs**: Shift Friday CS laboratories online or offer modular research project credits to accommodate student startup and hackathon build sessions.
2.  **Double Down on NVIDIA/OpenAI Prep**: Allocate additional mock interview quotas for alignment and GPU cluster system questions, as student eligibility is exceptionally high this quarter.

*Report generated automatically by Mr.Anish Generative Panda Ai Analytics Engine.*`
      });
    }

    const responseText = await generateAIContent({
      systemInstruction: systemPrompt,
      contents: `Active stats details:\n${JSON.stringify(stats, null, 2)}`,
    });

    res.json({ report: responseText });

  } catch (error: any) {
    console.error("AI Analytics Error:", error);
    res.status(500).json({ error: "AI Analytics generation failed.", details: error.message });
  }
});

// Setup dev server or static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mr.Anish Generative Panda Ai] Server listening at http://localhost:${PORT}`);
  });
}

startServer();
