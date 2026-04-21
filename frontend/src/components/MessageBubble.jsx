import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

// Custom renderers for each Markdown element
const PreBlock = ({ children }) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef(null);

  const handleCopy = () => {
    if (preRef.current) {
      const text = preRef.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="relative group my-3">
      <pre
        ref={preRef}
        className="rounded-md overflow-x-auto text-[0.82em] leading-relaxed
          border border-border-subtle"
        style={{ background: "#0d0d0d", padding: "1rem" }}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 
          text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 
          transition-all duration-200"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

const markdownComponents = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-text-primary mt-4 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-text-primary mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-text-primary mt-2 mb-1 first:mt-0">{children}</h3>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),

  // Bold / italic
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-text-secondary">{children}</em>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="mb-3 space-y-1 pl-5 list-disc marker:text-text-muted">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 space-y-1 pl-5 list-decimal marker:text-text-muted">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent/40 pl-3 my-3 text-text-secondary italic">
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded text-[0.82em] font-mono
            bg-white/[0.07] text-accent border border-white/10"
          {...props}
        >
          {children}
        </code>
      );
    }
    // Block code — wrapped by <pre>
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  // Code block wrapper
  pre: PreBlock,

  // Horizontal rule
  hr: () => <hr className="my-3 border-border-subtle" />,

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:text-accent-dim transition-colors duration-150"
    >
      {children}
    </a>
  ),

  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border border-border-subtle rounded-md border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-elevated border-b border-border-subtle">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-text-secondary text-xs uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-t border-border-subtle text-text-primary">{children}</td>
  ),
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 mb-5 animate-fade-up ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Square monogram avatar */}
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px]
          font-semibold shrink-0 mt-0.5 border
          ${isUser
            ? "bg-elevated border-border-subtle text-text-secondary"
            : "bg-elevated border-accent/30 text-accent"
          }`}
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Message body */}
      <div
        className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed rounded-lg border
          ${isUser
            ? "bg-accent/[0.08] border-accent/20 text-text-primary rounded-tr-sm"
            : "bg-elevated border-border-subtle text-text-primary rounded-tl-sm"
          }`}
      >
        {isUser ? (
          // User messages: plain text
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          // AI messages: full Markdown rendering
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
