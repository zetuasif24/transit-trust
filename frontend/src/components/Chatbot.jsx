import { useState, useRef, useEffect } from "react";

const API = "http://127.0.0.1:8000/api";

export default function Chatbot({ user }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello " + user.full_name.split(" ")[0] + "! 👋 I am your Transit Trust Assistant. I can help you with bus fares, routes, safety tips, or anything else. How can I help you today?"
    }
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API + "/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Make sure Django is running." }]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Hello " + user.full_name.split(" ")[0] + "! 👋 I am your Transit Trust Assistant. How can I help you?"
    }]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110">
        {open ? "✕" : "💬"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm">🤖</div>
              <div>
                <div className="text-sm font-bold text-white">Transit Assistant</div>
                <div className="text-xs text-emerald-400">● Online</div>
              </div>
            </div>
            <button onClick={clearChat}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-slate-700">
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">🤖</div>
                )}
                <div className={
                  "max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap " +
                  (m.role === "user"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-200 rounded-bl-sm")
                }>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">🤖</div>
                <div className="bg-slate-800 text-slate-400 px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl transition-colors font-bold text-sm">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
