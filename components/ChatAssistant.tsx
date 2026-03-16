import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, ChevronDownIcon } from './Icons';
import { chatWithAssistant } from '../services/geminiService';
import Markdown from 'react-markdown';
import { Movie } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatAssistantProps {
  onMovieClick: (movie: Movie) => void;
  searchMovieByTitle: (title: string) => Promise<Movie | null>;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onMovieClick, searchMovieByTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      parts: [{ text: '{"message": "Oi! Sou o assistente do Groselhinhas. Posso te dar dicas de filmes, explicar sinopses ou sugerir algo com base no seu humor. O que vamos assistir hoje?", "recommendations": []}' }]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: input.trim() }]
    };

    const currentHistory = [...messages];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithAssistant(userMessage.parts[0].text, currentHistory);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: responseText }]
      };
      
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-brand-accent text-brand-background shadow-xl shadow-amber-500/20 hover:scale-110 transition-transform z-50 flex items-center justify-center"
          aria-label="Abrir chat do assistente"
        >
          <SparklesIcon className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-brand-accent" />
              <h3 className="font-black italic text-white tracking-tight">CINEASTA IA</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-accent text-brand-background font-medium rounded-br-sm' 
                      : 'bg-white/5 text-gray-200 border border-white/5 rounded-bl-sm markdown-body'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.parts[0].text
                  ) : (
                    <div className="markdown-body">
                      {(() => {
                        try {
                          const parsed = JSON.parse(msg.parts[0].text);
                          return (
                            <>
                              <Markdown
                                components={{
                                  a: ({ node, ...props }) => {
                                    if (props.href?.startsWith('movie:')) {
                                      const title = decodeURIComponent(props.href.replace('movie:', ''));
                                      return (
                                        <button 
                                          onClick={async () => {
                                            const movie = await searchMovieByTitle(title);
                                            if (movie) onMovieClick(movie);
                                          }}
                                          className="text-brand-accent hover:underline font-bold inline-flex items-center gap-1"
                                        >
                                          {props.children}
                                        </button>
                                      );
                                    }
                                    return <a {...props} />;
                                  }
                                }}
                              >
                                {parsed.message}
                              </Markdown>
                              {parsed.recommendations && parsed.recommendations.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  {parsed.recommendations.map((rec: any, idx: number) => (
                                    <details key={idx} className="bg-white/5 border border-white/10 rounded-xl group overflow-hidden">
                                      <summary className="cursor-pointer p-3 font-bold text-brand-accent flex items-center justify-between hover:bg-white/5 transition-colors">
                                        {rec.title}
                                        <ChevronDownIcon className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                                      </summary>
                                      <div className="p-3 pt-0 text-sm text-gray-300">
                                        <p className="mb-3">{rec.description}</p>
                                        <button 
                                          onClick={async () => {
                                            const movie = await searchMovieByTitle(rec.title);
                                            if (movie) onMovieClick(movie);
                                          }}
                                          className="text-xs font-bold uppercase tracking-wider text-brand-background bg-brand-accent px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors"
                                        >
                                          Ver Detalhes
                                        </button>
                                      </div>
                                    </details>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        } catch (e) {
                          return <Markdown>{msg.parts[0].text}</Markdown>;
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-4 flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-brand-accent/50 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-brand-accent/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-brand-accent/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Peça uma recomendação..."
                className="w-full bg-black/50 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 rounded-full bg-brand-accent text-brand-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
