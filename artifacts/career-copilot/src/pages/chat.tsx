import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Plus, Loader2, Sparkles } from "lucide-react";
import { useListChatConversations, useCreateChatConversation, useGetChatConversation, getListChatConversationsQueryKey, getGetChatConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const { data: convs, isLoading: convsLoading } = useListChatConversations({
    query: { queryKey: getListChatConversationsQueryKey() }
  });

  const createConv = useCreateChatConversation();

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convList = Array.isArray(convs) ? convs : [];

  // Auto-select first conversation if available
  useEffect(() => {
    if (convList.length > 0 && !activeConvId) {
      setActiveConvId(convList[0].id);
    }
  }, [convList, activeConvId]);

  // Load selected conversation detail
  const { data: activeConv } = useGetChatConversation(activeConvId!, {
    query: { enabled: !!activeConvId, queryKey: getGetChatConversationQueryKey(activeConvId!) }
  });

  useEffect(() => {
    if (activeConv?.messages) {
      setMessages(activeConv.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleNewSession = () => {
    createConv.mutate({
      data: { title: "New Career Advisory Session" }
    }, {
      onSuccess: (newConv) => {
        queryClient.invalidateQueries({ queryKey: getListChatConversationsQueryKey() });
        setActiveConvId(newConv.id);
        setMessages([]);
      }
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let convId = activeConvId;

    if (!convId) {
      const newConv = await createConv.mutateAsync({ data: { title: inputText.slice(0, 30) } });
      convId = newConv.id;
      setActiveConvId(convId);
    }

    const userMsg = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                assistantMsg += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantMsg };
                  return updated;
                });
              }
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: getListChatConversationsQueryKey() });
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100dvh-8rem)] animate-in fade-in duration-500">
      {/* Sidebar Sessions */}
      <div className="w-64 border bg-card rounded-xl p-4 hidden md:flex flex-col gap-3 shrink-0">
        <button
          onClick={handleNewSession}
          disabled={createConv.isPending}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-3 rounded-lg font-medium text-sm hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> New Career Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase px-2">History</span>
          {convsLoading ? (
            <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            convList.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate font-medium transition-colors ${
                  activeConvId === c.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.title}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 bg-card border rounded-xl flex flex-col min-w-0 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-secondary font-serif">
            <Bot className="w-5 h-5 text-primary" /> AI Career Mentor & Advisor
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Sparkles className="w-10 h-10 text-primary/40" />
              <h3 className="text-lg font-bold text-secondary">How can I assist your career today?</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask about resume optimization, interview prep strategies, STAR framework examples, or target role roadmaps.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-secondary text-white" : "bg-primary/10 text-primary"
                }`}>
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/40 border border-border text-foreground rounded-tl-none whitespace-pre-wrap"
                }`}>
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t bg-muted/10 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your AI Career Copilot anything..."
            className="flex-1 px-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
