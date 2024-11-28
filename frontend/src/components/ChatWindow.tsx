'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Code2, MessageSquare, Send, Loader2, Sparkles, AlertCircle } from "lucide-react"

// Quick action suggestions
const QUICK_ACTIONS = [
  { label: "Add numbers", prompt: "Write a function to add two numbers" },
  { label: "Check palindrome", prompt: "Create a function to check if a string is palindrome" },
  { label: "Sort array", prompt: "Function to sort an array in ascending order" },
  { label: "Find max", prompt: "Function to find maximum number in an array" },
  { label: "Remove duplicates", prompt: "Function to remove duplicates from an array" },
  { label: "Count vowels", prompt: "Function to count vowels in a string" },
];

type Message = {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'error' | 'suggestion';
  code?: string;
  explanation?: string;
  timestamp: Date;
}

const generateCode = async (prompt: string) => {
  try {
    const response = await fetch('http://localhost:8000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'API request failed');
    }

    if (data.error) {
      return { error: data.error };
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

const initialMessages: Message[] = [
  {
    id: '1',
    content: "👋 Hi! I'm your JavaScript coding tutor. I can help you write JavaScript/TypeScript functions.",
    type: 'ai',
    timestamp: new Date()
  },
  {
    id: '2',
    content: "Try clicking one of the quick actions below or ask me about any JavaScript function!",
    type: 'suggestion',
    timestamp: new Date()
  }
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    handleSubmit(null, prompt);
  };

  const handleSubmit = async (e: React.FormEvent | null, quickActionPrompt?: string) => {
    e?.preventDefault();
    const promptToUse = quickActionPrompt || input;
    if (!promptToUse.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: promptToUse,
      type: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateCode(promptToUse);
      
      if (response.error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.error,
          type: 'error',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Here's what I've created:",
          type: 'ai',
          code: response.code,
          explanation: response.explanation,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        type: 'error',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-grow border border-purple-100 shadow-lg flex flex-col bg-white relative overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 animate-pulse">Generating code...</p>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-grow px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                      : message.type === 'error'
                      ? 'bg-red-100 border border-red-200'
                      : 'bg-gradient-to-br from-white to-gray-100 border border-gray-200'
                  }`}>
                    {message.type === 'user' ? (
                      <MessageSquare className="w-4 h-4 text-white" />
                    ) : message.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Code2 className="w-4 h-4 text-gray-700" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`rounded-xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-50 border border-red-100 text-red-800'
                        : message.type === 'suggestion'
                        ? 'bg-blue-50 border border-blue-100 text-blue-800'
                        : 'bg-gray-50 border border-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="p-4">
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                      {message.code && (
                        <div className="mt-3 relative rounded-lg overflow-hidden">
                          <pre className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                            <code className="text-sm font-mono">{message.code}</code>
                          </pre>
                        </div>
                      )}
                      {message.explanation && (
                        <p className="mt-2 text-sm italic opacity-90 border-t border-opacity-10 pt-2">
                          {message.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_ACTIONS.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                className="text-xs bg-white hover:bg-gray-50"
              >
                {action.label}
              </Button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a JavaScript function..."
              disabled={isLoading}
              className="flex-grow shadow-sm"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="shadow-sm transition-all duration-200 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}