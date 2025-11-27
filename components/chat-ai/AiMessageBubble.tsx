import React from "react";

interface AiMessageBubbleProps {
  children: React.ReactNode;
}

export function AiMessageBubble({ children }: AiMessageBubbleProps) {
  return (
    <div className="bg-white/5 border border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl px-4 py-3 shadow-sm backdrop-blur-[2px] text-sm leading-relaxed animate-ai-fade">
      {children}
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
      `}</style>
    </div>
  );
}
