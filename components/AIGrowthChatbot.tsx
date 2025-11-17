'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, Calendar, Mail } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  company: string;
  totalScore: number;
  stage: string;
  dimensionScores: Array<{
    name: string;
    percentage: number;
  }>;
  email?: string;
  mode?: 'scorecard' | 'dashboard';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track chat open event
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      // Track analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'chatbot_opened', {
          company,
          score: totalScore,
          stage,
        });
      }
    }
  }, [isOpen, hasGreeted, company, totalScore, stage]);

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      
      // Sort dimensions to find weakest and strongest
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
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };
      
      setMessages([greetingMessage]);
    }
  }, [isOpen, hasGreeted, company, totalScore, stage, dimensionScores, mode]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setShowTyping(true);

    // Track message sent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chatbot_message_sent', {
        company,
        message_length: currentInput.length,
      });
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          context: {
            company,
            totalScore,
            stage,
            dimensionScores,
            email,
            mode,
            conversationHistory: messages.slice(-6), // Last 3 exchanges for context
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Simulate typing delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Track successful response
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'chatbot_response_received', {
          company,
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `I apologize, but I'm having trouble connecting right now. 

You can still:
📧 Email us: info@apexdigitalafrica.com
📞 WhatsApp: +234-XXX-XXX-XXXX
📅 Book directly: https://calendly.com/apexdigitalafrica

I'll be back online soon!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setShowTyping(false);
    }
  };

  const quickActions = mode === 'dashboard' ? [
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

  const handleBooking = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chatbot_booking_clicked', {
        company,
        score: totalScore,
      });
    }
    window.open('https://bit.ly/africa-website', '_blank');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 flex items-center gap-2 group animate-bounce"
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

  return (
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
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-2 rounded-lg transition relative z-10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
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

        <div ref={messagesEndRef} />
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
                onClick={() => {
                  setInput(action.text);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="text-xs p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all text-left flex items-center gap-2 text-gray-800 font-medium shadow-sm hover:shadow-md"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="truncate leading-tight">{action.text}</span>
              </button>
            ))}
          </div>
          
          {mode === 'scorecard' && (
            <button
              onClick={handleBooking}
              className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Free Strategy Session
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800 bg-gray-50 placeholder-gray-500 hover:border-blue-400 transition"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
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
          from { opacity: 0; }
          to { opacity: 1; }
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
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
