'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, Calendar, Mail, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DimensionScore {
  name: string;
  percentage: number;
}

interface ChatbotProps {
  company: string;
  totalScore: number;
  stage: string;
  dimensionScores: DimensionScore[];
  email?: string;
  mode?: 'scorecard' | 'dashboard';
}

interface QuickAction {
  text: string;
  icon: string;
}

interface ApiError extends Error {
  status?: number;
}

// Error Boundary Component
class ChatbotErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chatbot Error:', error, errorInfo);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: 'Chatbot_error',
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Chat temporarily unavailable</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AIGrowthChatbot({ 
  company, 
  totalScore, 
  stage, 
  dimensionScores,
  email,
  mode = 'scorecard'
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate unique ID for messages
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Scroll to bottom utility
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages from localStorage
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(`aiChatbotMessages-${company}`);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
        setHasGreeted(true);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      localStorage.removeItem(`aiChatbotMessages-${company}`);
    }
  }, [company]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`aiChatbotMessages-${company}`, JSON.stringify(messages));
      } catch (err) {
        console.error('Failed to save chat history:', err);
      }
    }
  }, [messages, company]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Analytics tracking
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'chatbot_opened', {
          company,
          score: totalScore,
          stage,
          mode,
        });
      }
    }
  }, [isOpen, hasGreeted, company, totalScore, stage, mode]);

  // Initial greeting - optimized dependencies
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      
      const sortedDims = [...dimensionScores].sort((a, b) => a.percentage - b.percentage);
      const weakestDim = sortedDims[0];
      const strongestDim = sortedDims[sortedDims.length - 1];
      
      let greeting = '';
      
      if (mode === 'dashboard') {
        greeting = `Hi! 👋 I'm your AI Growth Consultant for Apex Digital Africa.

I can help you understand the scorecard submissions and provide insights on:
• Lead qualification strategies
• Industry benchmarks
• Conversion optimization
• Service recommendations

What would you like to know about your leads?`;
      } else {
        greeting = `Hi ${company} team! 👋 I'm your AI Growth Consultant.

I've analyzed your results:
📊 Score: ${totalScore}/100 (${stage} stage)
🎯 Strongest: ${strongestDim.name} (${strongestDim.percentage}%)
⚠️ Focus Area: ${weakestDim.name} (${weakestDim.percentage}%)

I'm here to:
• Answer questions about your results
• Provide actionable recommendations
• Help you book a free strategy session
• Discuss our growth services

What would you like to know?`;
      }
      
      const greetingMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };
      
      setMessages([greetingMessage]);
    }
  }, [isOpen, hasGreeted, company, totalScore, stage, dimensionScores, mode, messages.length]);

  // Enhanced sendMessage with proper error handling and performance
  const sendMessage = useCallback(async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Clear input immediately if using typed input
    if (!messageContent) {
      setInput('');
    }

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowTyping(true);
    setError(null);

    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chatbot_message_sent', {
        company,
        message_length: content.length,
        mode,
      });
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          message: content,
          context: {
            systemPrompt: `
You are "Synthesis," an elite AI Growth Consultant for Apex Digital Africa. The user is interacting via a chat widget.

USER CONTEXT:
- Company: ${company}
- Growth Score: ${totalScore}/100
- Growth Stage: ${stage}
- Dimension Scores: ${JSON.stringify(dimensionScores)}
- Mode: ${mode}
- Email: ${email || 'Not provided'}

YOUR DIRECTIVE:
1. Be hyper-strategic and actionable. Provide specific, tailored advice.
2. If discussing scores, analyze the STRONGEST and WEAKEST dimensions. Explain what improving weak areas means for their business.
3. For "dashboard" mode, focus on lead qualification, benchmarks, and service positioning.
4. Guide conversations toward booking strategy sessions naturally.
5. Be concise but powerful. Use bullet points and clear headings.
6. Fall back to core value proposition: data-driven growth for African businesses.

Always maintain professional, expert tone while being approachable.
            `.trim(),
            company,
            totalScore,
            stage,
            dimensionScores,
            email,
            mode,
            conversationHistory: messages.slice(-6).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'chatbot_response_received', { company });
      }
    } catch (err) {
      console.error('Chat API error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      
      const fallbackMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `I apologize, but I'm experiencing technical difficulties (${errorMessage}). 

You can:
📧 Email us directly: info@apexdigitalafrica.com  
📅 Book a session: https://calendly.com/apexdigitalafrica
🔄 Try again in a moment

I'll be back online shortly!`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'chatbot_error', {
          company,
          error: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
      setShowTyping(false);
    }
  }, [input, isLoading, company, totalScore, stage, dimensionScores, mode, email, messages]);

  // Quick actions configuration
  const quickActions: QuickAction[] = mode === 'dashboard' ? [
    { text: "How do I qualify leads?", icon: "🎯" },
    { text: "What's the avg conversion rate?", icon: "📊" },
    { text: "Industry benchmarks", icon: "📈" },
    { text: "Service packages", icon: "💼" },
  ] : [
    { text: "How can I improve my score?", icon: "📈" },
    { text: "What services do you offer?", icon: "🎯" },
    { text: "Book a strategy session", icon: "📅" },
    { text: "Pricing information", icon: "💰" },
  ];

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.text);
  };

  const handleBooking = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chatbot_booking_clicked', {
        company,
        score: totalScore,
        source: 'chatbot',
      });
    }
    window.open('https://calendly.com/apexdigitalafrica', '_blank');
  };

  const clearChat = () => {
    setMessages([]);
    setHasGreeted(false);
    localStorage.removeItem(`aiChatbotMessages-${company}`);
  };

  // Closed state
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 flex items-center gap-2 group focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        aria-label="Open AI Growth Consultant chat"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
          {mode === 'dashboard' ? 'AI Insights Assistant' : 'Chat with AI Consultant'}
        </span>
      </button>
    );
  }

  // Open state
  return (
    <ChatbotErrorBoundary
      fallback={
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-red-200 p-4">
          <div className="text-red-600 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="font-semibold">Chat temporarily unavailable</p>
            <p className="text-sm text-red-500 mt-1">Please refresh the page or try again later.</p>
          </div>
        </div>
      }
    >
      <div className="fixed bottom-6 right-6 w-96 h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-blue-600 animate-pulse" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <div className="font-bold text-lg">AI Growth Consultant</div>
              <div className="text-xs text-blue-100 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Online • Powered by Apex AI Engine
              </div>
            </div>
          </div>
          <div className="flex gap-1 relative z-10">
            <button
              onClick={clearChat}
              className="hover:bg-white/20 p-1.5 rounded-lg transition text-xs"
              aria-label="Clear conversation"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Connection issue: {error}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-3.5 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-lg'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-md border border-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {showTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-md border border-gray-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} aria-live="polite" aria-atomic="true" />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && !isLoading && (
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2.5 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Quick actions:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all text-left flex items-center gap-2 text-gray-800 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={isLoading}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="truncate leading-tight">{action.text}</span>
                </button>
              ))}
            </div>
            
            {mode === 'scorecard' && (
              <button
                onClick={handleBooking}
                className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                <Calendar className="w-4 h-4" />
                Book Free Strategy Session
              </button>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800 bg-gray-50 placeholder-gray-500 hover:border-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              AI-powered responses
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span>info@apexdigitalafrica.com</span>
            </div>
          </div>
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-shimmer {
            animation: shimmer 3s infinite;
          }
        `}</style>
      </div>
    </ChatbotErrorBoundary>
  );
}