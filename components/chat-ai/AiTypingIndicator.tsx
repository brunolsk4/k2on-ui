import React from "react";

export function AiTypingIndicator() {
  return (
    <div className="bg-white/5 border border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl px-4 py-3 shadow-sm backdrop-blur-[2px] text-sm">
      <div className="flex items-center gap-1 h-5 animate-ai-fade">
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: "0.12s" }} />
        <span className="typing-dot" style={{ animationDelay: "0.24s" }} />
      </div>
      <style jsx global>{`
        @keyframes ai-fade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-ai-fade {
          animation: ai-fade 0.18s ease-out;
        }
        @keyframes ai-bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          display: inline-block;
          animation: ai-bounce 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
