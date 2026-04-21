import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        {/* Geometric logo mark */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-5 opacity-60"
        >
          <path d="M12 2L14.5 9H9.5L12 2Z" fill="#38bdf8" />
          <rect x="9" y="8" width="6" height="8" rx="1" fill="#38bdf8" opacity="0.7" />
          <path d="M9 13L6 17H9V13Z" fill="#38bdf8" opacity="0.5" />
          <path d="M15 13L18 17H15V13Z" fill="#38bdf8" opacity="0.5" />
          <circle cx="12" cy="11" r="1.5" fill="#0a0a0a" />
          <rect x="10.5" y="16" width="3" height="2" rx="0.5" fill="#38bdf8" opacity="0.4" />
        </svg>
        <h2 className="text-[15px] font-semibold text-text-primary mb-2 tracking-tight">
          Start a conversation
        </h2>
        <p className="text-text-muted text-sm max-w-xs leading-relaxed">
          Select an existing chat or create a new one from the sidebar to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 pb-4">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg}
          />
        ))}

        {/* Subtle typing indicator while waiting for response */}
        {loading && (
          <div className="flex gap-3 mb-5">
            <div className="w-7 h-7 rounded-md bg-elevated border border-accent/30
              flex items-center justify-center text-[11px] font-semibold text-accent shrink-0 mt-0.5">
              AI
            </div>
            <div className="bg-elevated border border-border-subtle px-4 py-3 rounded-lg rounded-tl-sm
              flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
