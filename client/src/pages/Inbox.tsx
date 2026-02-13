import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Mic, Send, Phone, Video, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useVoiceStream } from "@/hooks/useVoiceStream";

// We assume these endpoints exist from the integration
interface Conversation {
  id: number;
  title: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'agent';
  content: string;
}

export default function Inbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  
  // Audio hooks
  const recorder = useVoiceRecorder();
  const stream = useVoiceStream({
    onComplete: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedId}`] });
    }
  });

  // Fetch conversations
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    }
  });

  // Fetch messages for selected conversation
  const { data: activeConversation } = useQuery<Conversation & { messages: Message[] }>({
    queryKey: [`/api/conversations/${selectedId}`],
    enabled: !!selectedId,
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${selectedId}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    }
  });

  // Send text message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedId) return;
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send");
      // For streaming text, we might handle it differently, but basic POST is okay here
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedId}`] });
      setInputText("");
    }
  });

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    sendMessage.mutate(inputText);
  };

  const handleMicClick = async () => {
    if (!selectedId) return;
    
    if (recorder.state === "recording") {
      const blob = await recorder.stopRecording();
      // Use the audio integration route for voice messages
      await stream.streamVoiceResponse(
        `/api/conversations/${selectedId}/messages`,
        blob
      );
    } else {
      await recorder.startRecording();
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] m-4 flex bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-in">
      {/* Sidebar List */}
      <div className="w-80 border-r border-border/50 flex flex-col bg-muted/10">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-bold text-lg font-display mb-4">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations?.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "p-4 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50",
                selectedId === conv.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-sm">{conv.title}</h3>
                <span className="text-xs text-muted-foreground">2m</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Click to view latest messages...
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                  {activeConversation?.title[0]}
                </div>
                <div>
                  <h3 className="font-bold">{activeConversation?.title}</h3>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Online
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeConversation?.messages?.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-3 max-w-[80%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold",
                    msg.role === 'user' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-white border border-border/50 rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-background">
              <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-2xl border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <button 
                  onClick={handleMicClick}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    recorder.state === 'recording' ? "bg-red-500 text-white animate-pulse" : "hover:bg-background text-muted-foreground"
                  )}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
