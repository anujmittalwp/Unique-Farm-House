import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi there! 👋 I am the Unique Farmhouse virtual assistant. Do you have any questions about our property, pool, or booking details?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Msg[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let systemPrompt = '';
      try {
        const docRef = doc(db, 'settings', 'chatbot_settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().value) {
          systemPrompt = docSnap.data().value;
        }
      } catch (e) {
        console.warn("Could not fetch custom prompt, falling back to default");
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, systemPrompt })
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'Oops! I am having trouble connecting right now. Please tap the WhatsApp button to chat with our human team!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-50 bg-luxury-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-luxury-gold transition-colors border border-white/10 group"
          >
            <MessageCircle size={28} />
            <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            <span className="absolute right-full mr-4 bg-white text-luxury-dark px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Need help? Ask me!
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 md:bottom-28 md:right-8 w-full md:w-[380px] h-[85vh] md:h-[600px] z-[60] bg-white md:rounded-3xl shadow-2xl flex flex-col border border-luxury-dark/5 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-luxury-dark text-white p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center text-luxury-gold relative">
                  <Sparkles size={20} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-luxury-dark" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Farmhouse Assistant</h3>
                  <p className="text-[10px] text-white/60">Powered by AI • Replies instantly</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-luxury-dark text-white' : 'bg-white border border-luxury-dark/10 text-luxury-gold shadow-sm'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-luxury-dark text-white rounded-tr-sm' : 'bg-white border border-luxury-dark/5 text-luxury-dark shadow-sm rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white border border-luxury-dark/10 text-luxury-gold shadow-sm">
                      <Loader2 size={14} className="animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-luxury-dark/5 shadow-sm rounded-tl-sm flex gap-1 items-center">
                      <div className="w-2 h-2 bg-luxury-dark/30 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-luxury-dark/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-luxury-dark/30 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-px w-full" />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-luxury-dark/5">
              <div className="flex items-end gap-2 bg-gray-50 border border-luxury-dark/10 rounded-2xl focus-within:border-luxury-gold focus-within:ring-2 focus-within:ring-luxury-gold/20 transition-all p-1 pl-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[44px] py-3 text-sm text-luxury-dark placeholder:text-luxury-dark/30"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 mb-1 flex items-center justify-center bg-luxury-gold text-luxury-dark rounded-xl font-bold hover:bg-luxury-dark hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-luxury-gold flex-shrink-0"
                >
                  <Send size={16} className="ml-1" />
                </button>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[9px] text-luxury-dark/30 font-medium uppercase tracking-widest">
                  AI responses may not be 100% accurate
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
