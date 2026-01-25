'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, User, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendChatMessage, getChatHistory, type School } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestedSchools?: number[];
}

interface AIChatProps {
  initialOpen?: boolean;
}

const ANONYMOUS_CHAT_LIMIT = 10;
const ANONYMOUS_CHAT_COUNT_KEY = 'anonymous_chat_count';

export const AIChat = ({ initialOpen = false }: AIChatProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSchools, setSuggestedSchools] = useState<School[]>([]);
  const [anonymousChatCount, setAnonymousChatCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide AI Chat on school enquiry page (embedded form)
  const isEnquiryPage = pathname?.includes('/enquiry') && pathname?.includes('/schools/');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Load anonymous chat count if not logged in
    if (!token) {
      const count = parseInt(localStorage.getItem(ANONYMOUS_CHAT_COUNT_KEY) || '0', 10);
      setAnonymousChatCount(count);
    }

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
    if (!token) {
      // Show welcome message for anonymous users
      setMessages([
        {
          sender: 'ai',
          content: "Hello! I'm your school search assistant. I can help you find the perfect school based on your requirements.\n\n💡 You can ask up to 10 questions without logging in. After that, please create a free account to continue.\n\nTry asking me:\n• Show me CBSE schools in Delhi under ₹1,0,000\n• Which schools have hostel facilities in Bangalore?\n• Top-rated schools for 6th grade in Mumbai\n\nHow can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    try {
      const { chat } = await getChatHistory(token);
      if (chat && chat.messages) {
        setMessages(chat.messages);
      } else {
        // Add welcome message if no history
        setMessages([
          {
            sender: 'ai',
            content: "Hello! I'm your school search assistant. I can help you find the perfect school based on your requirements. Try asking me something like:\n\n• Show me CBSE schools in Delhi under ₹1,0,000\n• Which schools have hostel facilities in Bangalore?\n• Top-rated schools for 6th grade in Mumbai\n\nHow can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const getLoginPromptMessage = (count: number): string | null => {
    if (count === 3) {
      return "🔔 You've used 3 out of 10 free chats. Create a free account to get unlimited access and personalized recommendations!";
    }
    if (count === 7) {
      return "⚠️ You've used 7 out of 10 free chats. Sign up now to unlock unlimited chats, save your favorite schools, and get better recommendations!";
    }
    if (count === 10) {
      return "🚫 You've reached the 10 chat limit for anonymous users. Please login or sign up to continue using the AI assistant and access all features!";
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('token');
    
    // Check anonymous chat limit
    if (!token) {
      if (anonymousChatCount >= ANONYMOUS_CHAT_LIMIT) {
        setShowLoginPrompt(true);
        toast.error('Please login to continue chatting', {
          action: {
            label: 'Login',
            onClick: () => router.push('/login'),
          },
        });
        return;
      }
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
      // For anonymous users, make API call without token
      let response, schools;
      if (token) {
        const result = await sendChatMessage(token, inputMessage);
        response = result.response;
        schools = result.schools;
      } else {
        // Call API without authentication
        const result = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputMessage }),
        });
        
        if (!result.ok) {
          throw new Error('Failed to get response');
        }
        
        const data = await result.json();
        response = data.message;
        schools = data.schools || [];

        // Increment anonymous chat count
        const newCount = anonymousChatCount + 1;
        setAnonymousChatCount(newCount);
        localStorage.setItem(ANONYMOUS_CHAT_COUNT_KEY, newCount.toString());

        // Check if we should show login prompt
        const promptMessage = getLoginPromptMessage(newCount);
        if (promptMessage) {
          setShowLoginPrompt(true);
        }
      }

      const aiMessage: Message = {
        sender: 'ai',
        content: response,
        timestamp: new Date().toISOString(),
        suggestedSchools: schools.map((s: School) => s.id),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSuggestedSchools(schools);

      // Add login prompt message if applicable
      if (!token) {
        const promptMessage = getLoginPromptMessage(anonymousChatCount + 1);
        if (promptMessage) {
          setTimeout(() => {
            const promptMsg: Message = {
              sender: 'ai',
              content: promptMessage,
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, promptMsg]);
          }, 500);
        }
      }
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

  if (isEnquiryPage) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full px-4 sm:px-6 h-12 sm:h-14 shadow-lg z-50 flex items-center gap-2 hover:scale-105 transition-transform"
        style={{ backgroundColor: '#04d3d3' }}
      >
        <MessageCircle size={20} className="text-white sm:w-6 sm:h-6" />
        <span className="text-white font-bold text-sm sm:text-base">AI Chat</span>
      </Button>
    );
  }

  const remainingChats = !isLoggedIn ? ANONYMOUS_CHAT_LIMIT - anonymousChatCount : null;

  return (
    <Card className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[100dvh] sm:h-[600px] sm:rounded-lg rounded-none shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex-shrink-0 rounded-none sm:rounded-t-lg" style={{ backgroundColor: '#04d3d3' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            <div className="flex flex-col">
              <CardTitle className="text-white text-sm sm:text-base">AI School Assistant</CardTitle>
              {!isLoggedIn && remainingChats !== null && (
                <span className="text-[10px] sm:text-xs text-white/80">
                  {remainingChats > 0 ? `${remainingChats} free chats left` : 'Login to continue'}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Login Banner for Anonymous Users */}
        {!isLoggedIn && showLoginPrompt && (
          <Alert className="m-2 sm:m-4 border-orange-300 bg-orange-50">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
            <AlertDescription className="text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-orange-800 text-[11px] sm:text-sm">
                  {anonymousChatCount >= ANONYMOUS_CHAT_LIMIT
                    ? 'Login for unlimited access!'
                    : 'Get unlimited chats & personalized recommendations'}
                </span>
                <Button
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="bg-orange-600 hover:bg-orange-700 text-white h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs"
                >
                  <LogIn size={12} className="mr-1 sm:w-[14px] sm:h-[14px]" />
                  Login
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 ${
                  message.sender === 'user'
                    ? 'text-white'
                    : 'bg-gray-100'
                }`}
                style={message.sender === 'user' ? { backgroundColor: '#04d3d3' } : {}}
              >
                <div className="flex items-start gap-1.5 sm:gap-2 mb-1">
                  {message.sender === 'ai' ? (
                    <Bot size={14} className="mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                  ) : (
                    <User size={14} className="mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                  )}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <p className={`text-[10px] sm:text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
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
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Suggested Schools:</p>
              {suggestedSchools.map((school) => (
                <Card
                  key={school.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/schools/${school.id}`);
                  }}
                >
                  <CardContent className="p-2.5 sm:p-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      {school.logo && (
                        <img
                          src={school.logo}
                          alt={school.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm mb-1 truncate">{school.name}</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">{school.board}</Badge>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">{school.city}</span>
                        </div>
                        {school.feesMin && school.feesMax && (
                          <p className="text-[10px] sm:text-xs font-medium" style={{ color: '#04d3d3' }}>
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
              <div className="bg-gray-100 rounded-lg p-2.5 sm:p-3 flex items-center gap-2">
                <Loader2 className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t p-3 sm:p-4 pb-[env(safe-area-inset-bottom,12px)] sm:pb-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={!isLoggedIn && anonymousChatCount >= ANONYMOUS_CHAT_LIMIT ? "Login to continue..." : "Ask me about schools..."}
              disabled={isLoading || (!isLoggedIn && anonymousChatCount >= ANONYMOUS_CHAT_LIMIT)}
              className="flex-1 h-10 sm:h-11 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || (!isLoggedIn && anonymousChatCount >= ANONYMOUS_CHAT_LIMIT)}
              className="h-10 w-10 sm:h-11 sm:w-11 p-0"
              style={{ backgroundColor: '#04d3d3', color: 'white' }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};