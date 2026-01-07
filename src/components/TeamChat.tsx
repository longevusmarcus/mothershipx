import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  X, 
  Users, 
  Trophy,
  Zap,
  Bot,
  Crown,
  MoreVertical,
  Phone,
  Video,
  Pin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Team, TeamMember } from "./TeamCard";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isAI?: boolean;
  isPinned?: boolean;
}

interface TeamChatProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    senderId: "1",
    senderName: "Alex",
    senderAvatar: "A",
    content: "This onboarding problem is huge — 67% drop-off rate. Anyone else seeing this in their products?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    senderId: "2",
    senderName: "Sarah",
    senderAvatar: "S",
    content: "Yeah, it's a real pain point. I've been thinking about a solution — what if we did progressive onboarding instead of dumping everything at once?",
    timestamp: "10:33 AM",
  },
  {
    id: "3",
    senderId: "ai",
    senderName: "Mothership AI",
    senderAvatar: "🤖",
    content: "Interesting direction! Market data shows 3 similar solutions exist but all target enterprise. There's a gap for SMBs. The competition score is 72% — meaning low saturation.",
    timestamp: "10:35 AM",
    isAI: true,
    isPinned: true,
  },
  {
    id: "4",
    senderId: "3",
    senderName: "Mike",
    senderAvatar: "M",
    content: "I'd be down to build this. Anyone serious about committing? I can do frontend/React",
    timestamp: "10:38 AM",
  },
  {
    id: "5",
    senderId: "2",
    senderName: "Sarah",
    senderAvatar: "S",
    content: "I'm in if we can scope it tight. What's the MVP look like? Maybe just a widget that guides first-time users?",
    timestamp: "10:40 AM",
  },
  {
    id: "6",
    senderId: "ai",
    senderName: "Mothership AI",
    senderAvatar: "🤖",
    content: "For MVP, I'd suggest: 1) Embeddable JS widget, 2) 3-step max flows, 3) Analytics dashboard. This covers the top 3 pain points from the signal data. Estimated 2-week build.",
    timestamp: "10:42 AM",
    isAI: true,
  },
  {
    id: "7",
    senderId: "1",
    senderName: "Alex",
    senderAvatar: "A",
    content: "That's actually doable. Who's committing? We need 1 more dev and someone for growth/distribution 👀",
    timestamp: "10:45 AM",
  },
];

export function TeamChat({ team, isOpen, onClose }: TeamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "You",
      senderAvatar: "Y",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate AI response if in AI mode
    if (isAIMode) {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: "ai",
          senderName: "Mothership AI",
          senderAvatar: "🤖",
          content: "I'm analyzing your request... Based on the market data, here's what I found: The target demographic shows strong engagement with mobile-first solutions. Consider prioritizing responsive design in your MVP.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1500);
      setIsAIMode(false);
    }
  };

  const onlineMembers = team.members.filter(m => m.isOnline).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-y-0 right-0 w-full sm:w-96 bg-background border-l border-border z-50 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {onlineMembers} online • {team.members.length} members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Team Stats */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-[10px]">
                <Trophy className="h-2.5 w-2.5" />
                Rank #{team.rank || "—"}
              </Badge>
              <Badge variant="outline" className="gap-1 text-[10px] text-warning border-warning/30">
                <Zap className="h-2.5 w-2.5" />
                +{team.momentum}% momentum
              </Badge>
            </div>

            {/* Online Members */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {team.members.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-[10px] bg-secondary">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {team.members.map(m => m.name.split(' ')[0]).join(', ')}
              </span>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-2 ${message.senderId === "current-user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className={`h-8 w-8 flex-shrink-0 ${message.isAI ? "ring-2 ring-primary/50" : ""}`}>
                    <AvatarFallback className={`text-xs ${message.isAI ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>
                      {message.isAI ? <Bot className="h-4 w-4" /> : message.senderAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`space-y-1 max-w-[75%] ${message.senderId === "current-user" ? "items-end" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{message.senderName}</span>
                      {message.isAI && (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 gap-0.5">
                          <Sparkles className="h-2 w-2" />
                          AI
                        </Badge>
                      )}
                      {message.isPinned && (
                        <Pin className="h-2.5 w-2.5 text-primary" />
                      )}
                      <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <div 
                      className={`p-3 rounded-2xl text-sm ${
                        message.senderId === "current-user" 
                          ? "bg-primary text-primary-foreground rounded-br-md" 
                          : message.isAI
                          ? "bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-bl-md"
                          : "bg-secondary rounded-bl-md"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border space-y-3">
            {/* AI Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant={isAIMode ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs h-7"
                onClick={() => setIsAIMode(!isAIMode)}
              >
                <Bot className="h-3 w-3" />
                {isAIMode ? "AI Mode Active" : "Ask AI"}
              </Button>
              <span className="text-[10px] text-muted-foreground">
                {isAIMode ? "AI will respond to your next message" : ""}
              </span>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder={isAIMode ? "Ask Mothership AI..." : "Type a message..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className={`flex-1 ${isAIMode ? "border-primary/50 bg-primary/5" : ""}`}
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                variant={isAIMode ? "glow" : "default"}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
