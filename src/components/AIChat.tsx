'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sendChatMessage, getChatHistory, type School } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestedSchools?: number[];
}

interface AIChatProps {
  initialOpen?: boolean;
}

export const AIChat = ({ initialOpen = false }: AIChatProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSchools, setSuggestedSchools] = useState<School[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { chat } = await getChatHistory(token);
      if (chat && chat.messages) {
        setMessages(chat.messages);
      } else {
        // Add welcome message if no history
        setMessages([
          {
            sender: 'ai',
            content: "Hello! I'm your school search assistant. I can help you find the perfect school based on your requirements. Try asking me something like:\n\n• Show me CBSE schools in Delhi under ₹1,00,000\n• Which schools have hostel facilities in Bangalore?\n• Top-rated schools for 6th grade in Mumbai\n\nHow can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to use the chat feature');
      router.push('/login');
      return;
    }

    const userMessage: Message = {
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { response, schools } = await sendChatMessage(token, inputMessage);

      const aiMessage: Message = {
        sender: 'ai',
        content: response,
        timestamp: new Date().toISOString(),
        suggestedSchools: schools.map(s => s.id),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSuggestedSchools(schools);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to get response. Please try again.');
      
      const errorMessage: Message = {
        sender: 'ai',
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        style={{ backgroundColor: '#04d3d3' }}
      >
        <MessageCircle size={24} className="text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex-shrink-0" style={{ backgroundColor: '#04d3d3' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-white" size={24} />
            <CardTitle className="text-white">AI School Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X size={20} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'text-white'
                    : 'bg-gray-100'
                }`}
                style={message.sender === 'user' ? { backgroundColor: '#04d3d3' } : {}}
              >
                <div className="flex items-start gap-2 mb-1">
                  {message.sender === 'ai' ? (
                    <Bot size={16} className="mt-1 flex-shrink-0" />
                  ) : (
                    <User size={16} className="mt-1 flex-shrink-0" />
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Suggested Schools */}
          {suggestedSchools.length > 0 && messages[messages.length - 1]?.sender === 'ai' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Suggested Schools:</p>
              {suggestedSchools.map((school) => (
                <Card
                  key={school.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/schools/${school.id}`);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {school.logo && (
                        <img
                          src={school.logo}
                          alt={school.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1 truncate">{school.name}</p>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{school.board}</Badge>
                          <span className="text-xs text-muted-foreground">{school.city}</span>
                        </div>
                        {school.feesMin && school.feesMax && (
                          <p className="text-xs font-medium" style={{ color: '#04d3d3' }}>
                            ₹{(school.feesMin / 1000).toFixed(0)}K - ₹{(school.feesMax / 1000).toFixed(0)}K/year
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about schools..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              style={{ backgroundColor: '#04d3d3', color: 'white' }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
