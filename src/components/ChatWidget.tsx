"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/Button";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen, error]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  function getMessageText(message: any): string {
    if (typeof message.content === "string" && message.content.trim()) {
      return message.content;
    }
    if (Array.isArray(message.parts)) {
      return message.parts
        .filter((p: any) => "text" in p && typeof p.text === "string")
        .map((p: any) => p.text)
        .join("\n");
    }
    return "";
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "var(--brand-primary)" }}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <span className="text-white text-xl">✕</span>
        ) : (
          <span className="text-white text-xl">💬</span>
        )}
      </button>

      {/* Chat drawer */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[350px] flex-col overflow-hidden rounded-xl border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
                aria-hidden="true"
              />
              <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                FixNear Assistant
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-xs font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div
                className="rounded-lg p-3 text-xs leading-relaxed"
                style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-secondary)" }}
              >
                👋 Hi! Ask me anything about FixNear — how it works, finding service providers, or listing your service.
              </div>
            )}

            {messages.map((message) => {
              const text = getMessageText(message);
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className="max-w-[85%] rounded-lg px-3.5 py-2 text-sm leading-relaxed"
                    style={{
                      backgroundColor:
                        message.role === "user"
                          ? "var(--brand-primary)"
                          : "var(--bg-muted)",
                      color:
                        message.role === "user" ? "#fff" : "var(--text-primary)",
                    }}
                  >
                    {text || (isLoading && message.role === "assistant" ? "Thinking…" : null)}
                  </div>
                </div>
              );
            })}

            {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div
                  className="rounded-lg px-3.5 py-2 text-xs font-medium animate-pulse"
                  style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}
                >
                  Thinking…
                </div>
              </div>
            )}

            {error && (
              <div
                className="rounded-lg p-3 text-xs text-red-600 border border-red-200"
                style={{ backgroundColor: "#fef2f2" }}
              >
                Something went wrong. Please check your API key or server logs.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t px-3 py-3"
            style={{ borderColor: "var(--border-light)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 rounded-md border px-3 py-2 text-sm outline-none transition-shadow focus:ring-2"
              style={{
                borderColor: "var(--border-medium)",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}