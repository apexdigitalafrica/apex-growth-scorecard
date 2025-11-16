import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles } from 'lucide-react';

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
}

export default function AIGrowthChatbot({ company, totalScore, stage, dimensionScores }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const weakestDim = [...dimensionScores].sort((a, b) => a.percentage - b.percentage)[0];
      
      const greeting: Message = {
        role: 'assistant',
        content: `Hi ${company} team! 👋 I'm your AI Growth Consultant. I've analyzed your scorecard results (${totalScore}/100 - ${stage} stage).

I noticed your ${weakestDim.name} scored ${weakestDim.percentage}%, which presents a great opportunity for improvement.

I'm here to:
• Answer questions about your results
• Provide specific recommendations
• Help you book a strategy session
• Discuss our growth services

What would you like to know?`,
        timestamp: new Date(),
      };
      
      setMessages([greeting]);
    }
  }, [isOpen, hasGreeted, company, totalScore, stage, dimensionScores]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call your API that uses Claude
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            company,
            totalScore,
            stage,
            dimensionScores,
            conversationHistory: messages,
          },
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try booking a strategy session directly, or contact us at info@apexdigitalafrica.com",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { text: "How can I improve my score?", icon: "📈" },
    { text: "What services do you offer?", icon: "🎯" },
    { text: "Book a strategy session", icon: "📅" },
    { text: "Pricing information", icon: "💰" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2 group"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
          Chat with AI Growth Consultant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-gray-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className="font-bold">AI Growth Consultant</div>
            <div className="text-xs text-blue-100">Powered by Claude AI</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-2 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
              <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="text-xs text-gray-700 mb-2 font-semibold">Quick actions:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(action.text);
                  sendMessage();
                }}
                className="text-xs p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition text-left flex items-center gap-1.5 text-gray-900 font-semibold shadow-sm"
              >
                <span className="text-base">{action.icon}</span>
                <span className="truncate text-gray-900">{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-lg transition ${
              input.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          AI-powered by Claude • Responses may take a few seconds
        </div>
      </div>
    </div>
  );
}