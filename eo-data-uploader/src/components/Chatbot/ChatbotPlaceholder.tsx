import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bot, Send, Image, Paperclip, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
  data?: any;
};

const ChatbotPlaceholder = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your EO Data Center AI Assistant powered by Mistral. Ask me anything about your database!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantReply = data.answer || "❌ No answer received.";
      const sqlData = data.data;

      const delay = Math.min(3000, assistantReply.length * 25); // up to 3s max
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: assistantReply, isUser: false, timestamp: new Date(), data: sqlData },
        ]);
        setIsTyping(false);
      }, delay);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "❌ Error: Unable to retrieve answer. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-15rem)] glass-card">
      <CardHeader className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">EO Data Assistant</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Mistral Powered
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-start gap-3 max-w-[80%]",
                message.isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                  message.isUser ? "bg-primary" : "bg-primary/15"
                )}
              >
                {message.isUser ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap",
                  message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <p>{message.text}</p>
                {message.data && !message.isUser && (
                  <div className="mt-2">
                    {Array.isArray(message.data) && message.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="text-xs border border-gray-300 rounded w-full">
                          <thead>
                            <tr>
                              {Object.keys(message.data[0]).map((col) => (
                                <th key={col} className="border px-2 py-1 bg-gray-100 text-gray-700">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {message.data.map((row: any, i: number) => (
                              <tr key={i}>
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="border px-2 py-1">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <pre className="bg-gray-100 rounded p-2 text-xs text-gray-700 mt-1">{JSON.stringify(message.data, null, 2)}</pre>
                    )}
                  </div>
                )}
                <div className="text-[10px] opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 max-w-[80%] mr-auto"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg px-4 py-2.5 text-sm bg-muted animate-pulse">
                <p>Typing...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="p-4 border-t border-border">
        <div className="flex items-center w-full gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Image className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something like: what's the avg CPU?"
              className="pr-10"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full aspect-square rounded-full"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatbotPlaceholder;
