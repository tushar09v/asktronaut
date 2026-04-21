import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

// Import the same markdown component styles from MessageBubble
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
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-text-primary mt-4 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-text-primary mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-text-primary mt-2 mb-1 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-text-secondary">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 space-y-1 pl-5 list-disc marker:text-text-muted">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 space-y-1 pl-5 list-decimal marker:text-text-muted">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent/40 pl-3 my-3 text-text-secondary italic">
      {children}
    </blockquote>
  ),
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
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: PreBlock,
  hr: () => <hr className="my-3 border-border-subtle" />,
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

export default function TypewriterText({ fullText, onComplete }) {
  const [displayLength, setDisplayLength] = useState(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const completedRef = useRef(false);

  const getDelay = useCallback((charIndex) => {
    // Start slow, speed up after 30 chars
    if (charIndex < 10) return 25;
    if (charIndex < 30) return 15;
    return 8;
  }, []);

  useEffect(() => {
    if (!fullText) return;
    setDisplayLength(0);
    completedRef.current = false;
    lastTimeRef.current = 0;

    const step = (timestamp) => {
      if (completedRef.current) return;

      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      const currentLen = displayLength; // captured via closure won't work, use functional update

      setDisplayLength((prev) => {
        if (prev >= fullText.length) {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
          return prev;
        }

        const delay = getDelay(prev);
        if (elapsed >= delay) {
          lastTimeRef.current = timestamp;
          // Advance by 1 char, or 2–3 for very fast sections
          const step = prev >= 30 ? 2 : 1;
          return Math.min(prev + step, fullText.length);
        }
        return prev;
      });

      if (!completedRef.current) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [fullText]);

  // Trigger completion callback when we reach full length
  useEffect(() => {
    if (displayLength >= (fullText?.length ?? 0) && fullText && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [displayLength, fullText]);

  const partialText = fullText?.slice(0, displayLength) ?? "";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={markdownComponents}
    >
      {partialText}
    </ReactMarkdown>
  );
}
