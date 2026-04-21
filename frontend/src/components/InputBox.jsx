import { useState } from "react";
import { ArrowUp, Square, RefreshCw } from "lucide-react";

export default function InputBox({ 
  onSend, 
  disabled, 
  isGenerating, 
  onStop, 
  showRegenerate, 
  onRegenerate 
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    // Prevent cross-component interference: Ensure we ONLY react to this exact textarea
    if (e.target !== e.currentTarget) return;

    if (e.key === "Enter" && !e.shiftKey) {
      // Prevent the default newline insertion
      e.preventDefault();

      // Ensure we don't accidentally send if loading or empty
      const text = input.trim();
      if (!text || disabled) return;

      onSend(text);
      setInput("");
    }
  };

  return (
    <div className="border-t border-border-subtle bg-surface px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div
          className={`flex items-end gap-2 bg-elevated rounded-md border
            transition-colors duration-150
            ${disabled ? "border-border-subtle" : "border-border-subtle focus-within:border-accent"}`}
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message…"
            disabled={disabled}
            className="flex-1 bg-transparent text-text-primary text-sm outline-none resize-none
              placeholder-text-muted max-h-36 overflow-y-auto px-3.5 py-3 leading-relaxed
              disabled:opacity-50"
          />
          <div className="px-2 py-2 shrink-0">
            {isGenerating ? (
              <button
                onClick={onStop}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-150"
                aria-label="Stop generating"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : showRegenerate && !input.trim() ? (
              <button
                onClick={onRegenerate}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-elevated border border-accent/40 text-accent hover:bg-accent/10 transition-colors duration-150"
                aria-label="Regenerate response"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={disabled || !input.trim()}
                className="w-8 h-8 rounded-md bg-accent hover:bg-accent-dim
                  disabled:opacity-30 disabled:cursor-not-allowed
                  flex items-center justify-center
                  transition-colors duration-150 text-base"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-text-muted text-[11px] mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
