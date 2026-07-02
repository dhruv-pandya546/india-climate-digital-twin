import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Brain, RefreshCw, HelpCircle } from "lucide-react";
import { ChatMessage, ScenarioParameters } from "../types";

interface AIAnalystProps {
  scenario: ScenarioParameters;
}

// Simple, robust inline markdown-style formatter to render standard Markdown elements beautifully
const formatMarkdownText = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    let content = line.trim();

    // Headers
    if (content.startsWith("###")) {
      return (
        <h4 key={idx} className="text-sm font-bold text-cyan-400 mt-3 mb-1 border-b border-cyan-900/30 pb-1 font-sans">
          {content.replace("###", "").trim()}
        </h4>
      );
    }
    if (content.startsWith("##")) {
      return (
        <h3 key={idx} className="text-base font-bold text-cyan-300 mt-4 mb-2 border-b border-cyan-950 pb-1 font-sans">
          {content.replace("##", "").trim()}
        </h3>
      );
    }
    if (content.startsWith("#")) {
      return (
        <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2 font-sans">
          {content.replace("#", "").trim()}
        </h2>
      );
    }

    // Bullet Lists
    if (content.startsWith("*") || content.startsWith("-")) {
      const cleanLi = content.substring(1).trim();
      return (
        <li key={idx} className="ml-4 list-disc text-slate-300 text-xs my-1 pl-1 leading-relaxed">
          {renderBoldText(cleanLi)}
        </li>
      );
    }

    // Numbered lists
    const numMatch = content.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <li key={idx} className="ml-4 list-decimal text-slate-300 text-xs my-1 pl-1 leading-relaxed">
          {renderBoldText(numMatch[2])}
        </li>
      );
    }

    // Standard paragraph
    if (content === "") return <div key={idx} className="h-2"></div>;

    return (
      <p key={idx} className="text-xs text-slate-300 my-1 leading-relaxed">
        {renderBoldText(content)}
      </p>
    );
  });
};

// Internal bold helper (**bold**)
const renderBoldText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-cyan-400 font-semibold">{part}</strong>;
    }
    return part;
  });
};

export const AIAnalyst: React.FC<AIAnalystProps> = ({ scenario }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "👋 **Welcome to the ISRO-IMD Climate Twin AI Analyst.**\n\nI can interpret gridded observations, downscaled simulations, and assess active What-If climate scenarios across Indian states. Click the **Generate Scenario Brief** button below or ask a question directly to begin climate consultation.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    "Fusing INSAT-3R gridded temperature anomalies...",
    "Retrieving IMD Gridded Rainfall database (0.25° x 0.25°)...",
    "Running EnKF data assimilation step across 22 States...",
    "Formulating downscaled lapse-rates for Western Ghats...",
    "Generating model confidence matrix and adaptation forecasts...",
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputInputText("");
    setIsLoading(true);

    // Dynamic weather station simulation loads
    let stepIdx = 0;
    setLoadStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadStep(steps[stepIdx]);
      } else {
        clearInterval(stepInterval);
      }
    }, 450);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          scenario,
          history: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI server");
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, modelMsg]);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "⚠️ **Simulation Brief Interrupt**: Unable to fuse model outputs. Please verify that your dev server is active and the environment is initialized correctly.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const generateScenarioBrief = () => {
    const briefPrompt = `Analyze the current What-If simulation parameters. Global Temperature Anomaly of ${scenario.tempAnomaly >= 0 ? '+' : ''}${scenario.tempAnomaly}°C, Rainfall deviation of ${scenario.rainChange >= 0 ? '+' : ''}${scenario.rainChange}%, Monsoon shift of ${scenario.monsoonShift} days, SST anomaly of ${scenario.sstChange >= 0 ? '+' : ''}${scenario.sstChange}°C, and Aerosols index of ${scenario.aerosols}x. What are the key state-level climate risks and Atmanirbhar Bharat adaptation guidelines?`;
    handleSendMessage(briefPrompt);
  };

  const samplePrompts = [
    { label: "Ocean Warming", text: "How does a +1.5°C SST anomaly affect Bay of Bengal cyclones?" },
    { label: "Monsoon Deficit", text: "What are the early signs of a severe monsoon delay in Northwest India?" },
    { label: "Bhuvan Systems", text: "How can ISRO Bhuvan satellite datasets improve localized farming adaptation?" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/20">
            भ
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Climate AI Companion</h4>
            <p className="text-[10px] text-cyan-400/80 font-mono">Powered by Gemini 3.5 Flash</p>
          </div>
        </div>
        <button
          onClick={generateScenarioBrief}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 rounded-md transition-all duration-150 cursor-pointer shadow-sm shadow-cyan-600/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Brief Simulation</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-900/60 custom-scrollbar max-h-[350px]">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-950/80 border border-cyan-800/40 text-cyan-100 rounded-tr-none shadow-sm shadow-cyan-950/40"
                  : "bg-slate-950/80 border border-slate-800/80 text-slate-100 rounded-tl-none shadow-sm shadow-black/40"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-slate-400 font-mono">
                {msg.role === "user" ? <HelpCircle className="w-3 h-3 text-cyan-400" /> : <Brain className="w-3 h-3 text-emerald-400" />}
                <span>{msg.role === "user" ? "GRID INQUIRY" : "AI SCIENTIFIC TWIN"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="space-y-1">{formatMarkdownText(msg.text)}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="max-w-[80%] rounded-xl rounded-tl-none p-3 bg-slate-950/70 border border-slate-800 text-xs text-slate-300 shadow-inner">
              <div className="flex items-center gap-2 text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="font-semibold text-[10px] font-mono tracking-wider uppercase">MODEL INGESTION ACTIVE</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 italic transition-all duration-300">{loadStep}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {!isLoading && (
        <div className="px-3 pb-2 border-t border-slate-800/40 pt-2 bg-slate-950/20">
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text)}
                className="px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-cyan-400 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-cyan-850 rounded-md transition-all cursor-pointer font-mono"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex items-center gap-2 p-2 bg-slate-950 border-t border-slate-800"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputInputText(e.target.value)}
          placeholder="Ask AI Twin about crops, SST, monsoon shifts..."
          disabled={isLoading}
          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 rounded-lg text-white transition-all cursor-pointer shadow-sm shadow-cyan-600/30"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
