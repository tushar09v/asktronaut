import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import InputBox from "../components/InputBox";
import { getChatByIdAPI, sendStreamingMessageAPI } from "../services/api";

export default function Chat() {
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingIndex, setTypingIndex] = useState(null);

  // New states for streaming
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);
  const abortControllerRef = useRef(null);
  const lastQueryRef = useRef("");

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setTypingIndex(null);
      setShowRegenerate(false);
      setIsRegenerating(false);
      return;
    }
    const fetchMessages = async () => {
      try {
        const { data } = await getChatByIdAPI(activeChatId);
        setMessages(data.messages);
        setTypingIndex(null);
        setShowRegenerate(false);
        setIsRegenerating(false);
      } catch (err) {
        console.error("Failed to load chat");
      }
    };
    fetchMessages();

    // Cleanup abort controller on unmount or chat change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeChatId]);

  const handleTypingComplete = useCallback(() => {
    setTypingIndex(null);
  }, []);

  const handleSend = async (content, isRegenerateCall = false) => {
    if (!activeChatId) return;

    let apiContent = "";

    if (isRegenerateCall) {
      setIsRegenerating(true);
      apiContent = lastQueryRef.current;

      setMessages((prev) => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === "assistant") {
          newMsgs.pop();
        }
        newMsgs.push({ role: "assistant", content: "" });
        return newMsgs;
      });
    } else {
      setIsRegenerating(false);
      lastQueryRef.current = content;
      apiContent = content;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: apiContent },
        { role: "assistant", content: "" }
      ]);
    }

    setLoading(true);
    setTypingIndex(null);
    setShowRegenerate(false);
    setIsGenerating(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendStreamingMessageAPI(
        activeChatId,
        apiContent,
        abortControllerRef.current.signal,
        isRegenerateCall
      );
      
      setLoading(false); // Stop loading animation, streaming starts

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let responseContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "chunk" && data.content) {
                responseContent += data.content;
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = responseContent;
                  return newMsgs;
                });
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              // Parse error on split chunk, ignore
            }
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Stream stopped by user");
        setShowRegenerate(true);
      } else {
        setMessages((prev) => {
          const newMsgs = [...prev];
          if (newMsgs[newMsgs.length - 1].content === "") {
            newMsgs[newMsgs.length - 1].content = "Failed to get a response. Please try again.";
          }
          return newMsgs;
        });
      }
    } finally {
      setIsGenerating(false);
      setLoading(false);
      abortControllerRef.current = null;
      setIsRegenerating(false); // Reset when generation finishes or fails
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    abortControllerRef.current = null;
    setIsRegenerating(false);
  };

  const handleRegenerate = () => {
    if (lastQueryRef.current) {
      handleSend(lastQueryRef.current, true);
    }
  };

  return (
    <div className="flex h-screen bg-base overflow-hidden relative">
      <div className="starfield" />

      <div className="relative z-10">
        <Sidebar
          activeChatId={activeChatId}
          onSelectChat={(id) => setActiveChatId(id)}
          onNewChat={(id) => {
            setActiveChatId(id);
            setMessages([]);
            setTypingIndex(null);
            setShowRegenerate(false);
          }}
        />
      </div>

      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {activeChatId ? (
          <>
            <ChatWindow
              messages={messages}
              loading={loading}
              typingIndex={typingIndex}
              onTypingComplete={handleTypingComplete}
            />
            <InputBox 
              onSend={handleSend} 
              disabled={isGenerating} 
              isGenerating={isGenerating}
              onStop={handleStop}
              showRegenerate={showRegenerate}
              onRegenerate={handleRegenerate}
            />
          </>
        ) : (
          <ChatWindow messages={[]} loading={false} />
        )}
      </div>
    </div>
  );
}
