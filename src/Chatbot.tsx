import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getAI, safeAiCall } from './lib/ai';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'form';
  formSubmitted?: boolean;
}

const LeadForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    guests: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        tags: formData.guests ? [`${formData.guests} Guests`] : [],
        status: 'new',
        source: 'chatbot_form',
        createdAt: serverTimestamp()
      });
      onSubmit(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-luxury-gold/20 shadow-inner mt-2 space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Full Name</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 bg-luxury-dark/5 border-none rounded-lg text-sm focus:ring-1 focus:ring-luxury-gold outline-none transition-all"
            placeholder="Your Name"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Mobile Number</label>
          <input 
            type="tel" 
            required
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 bg-luxury-dark/5 border-none rounded-lg text-sm focus:ring-1 focus:ring-luxury-gold outline-none transition-all"
            placeholder="+91 ..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Email Address</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 bg-luxury-dark/5 border-none rounded-lg text-sm focus:ring-1 focus:ring-luxury-gold outline-none transition-all"
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Total Guests</label>
          <input 
            type="number" 
            value={formData.guests}
            onChange={(e) => setFormData({...formData, guests: e.target.value})}
            className="w-full px-3 py-2 bg-luxury-dark/5 border-none rounded-lg text-sm focus:ring-1 focus:ring-luxury-gold outline-none transition-all"
            placeholder="Number of guests"
          />
        </div>
      </div>
      <button 
        onClick={handleSubmit}
        disabled={loading || !formData.name || !formData.phone}
        className="w-full py-3 bg-luxury-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-luxury-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : 'Request Quote'}
      </button>
    </div>
  );
};

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

  const handleFormSubmit = (data: any) => {
    setMessages(prev => {
      // 1. Mark the form as submitted in the last message
      const updatedMessages = [...prev];
      const lastIdx = updatedMessages.length - 1;
      if (updatedMessages[lastIdx].role === 'assistant' && updatedMessages[lastIdx].type === 'form') {
        updatedMessages[lastIdx] = { ...updatedMessages[lastIdx], formSubmitted: true };
      }
      
      // 2. Add the user's submission "event" and assistant's acknowledgment
      return [
        ...updatedMessages,
        { role: 'user', content: `Submitted my details: Name: ${data.name}, Mobile: ${data.phone}, Email: ${data.email}, Guests: ${data.guests}` },
        { role: 'assistant', content: `Thank you, ${data.name}! I have received your details. Our team will contact you shortly to plan your stay at Unique Farmhouse. Is there anything else I can help you with in the meantime?` }
      ];
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Create new messages array including the one just sent
    const updatedMessages: Msg[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);

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

      // Initialize Gemini Model
      const ai: any = getAI();
      
      // Property Knowledge Base
      const propertyInfo = `Unique Farmhouse Noida (Sector 135).
- Luxury 4 BHK Villa with 4 private rooms.
- Private swimming pool.
- Huge lawn for parties/events.
- Amenities: AC, Wi-Fi, Kitchen, Modern Interiors.
- Rules: Follow concise instruction.`;

      const userProvidedDetails = messages.some(m => m.content.includes("Submitted my details:"));
      
      let baseInstruction = systemPrompt || `You are the Unique Farmhouse assistant. 
Answer ONLY what is asked. 
Be extremely short (STRICTLY 1 sentence). 
NO greetings, NO extra details, NO pleasantries.
Answer the question directly.

${propertyInfo}

If booking/quote: "Please share your Name, Mobile, Email, and Total Guests."`;

      let systemInstruction = baseInstruction;
      if (userProvidedDetails) {
        systemInstruction += "\n\nCRITICAL SYSTEM OVERRIDE: The user HAS provided their details. DO NOT ask for their name, mobile, email, or guests again. DO NOT output 'save_lead'. Answer their questions and provide quotes directly. You must give them the prices immediately if they ask.";
      }

      // Construct a valid conversation starting with user
      const apiContents = updatedMessages
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map(m => ({
          role: (m.role === 'assistant' ? 'model' : 'user') as "model" | "user",
          parts: [{ text: m.content }]
        }));

      // Use allowed model alias
      const modelId = "gemini-3-flash-preview";

      const response = await safeAiCall(() => ai.models.generateContent({
        model: modelId,
        contents: apiContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        }
      }));
      
      let finalReply = "";
      try {
        finalReply = response.text || "";
      } catch (err) {
        // Handle cases where response.text might throw (e.g. safety blocks)
        finalReply = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
      
      if (!finalReply) {
        console.warn("AI returned empty reply, using fallback.");
        finalReply = "I am a bit busy right now. Please message us on WhatsApp (+91 7503001001) for the best price!";
      }

      // Detection of lead collection request
      const needsForm = finalReply.toLowerCase().includes('name') && 
                        finalReply.toLowerCase().includes('mobile') && 
                        finalReply.toLowerCase().includes('email') && 
                        finalReply.toLowerCase().includes('guests');

      setMessages(prev => {
        const nextMsgs: Msg[] = [...prev];
        if (needsForm) {
          nextMsgs.push({ role: 'assistant', content: finalReply, type: 'form' });
        } else {
          nextMsgs.push({ role: 'assistant', content: finalReply });
        }
        return nextMsgs;
      });
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      const errorMsg = error.message?.includes("Quota exceeded") 
        ? "I'm currently resting (Quota Exceeded). Please click the WhatsApp button to chat with our team!" 
        : 'Oops! I am having trouble connecting right now. Please tap the WhatsApp button to chat with our human team!';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
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
                      {msg.role === 'assistant' && msg.type === 'form' && !msg.formSubmitted && (
                        <LeadForm onSubmit={handleFormSubmit} />
                      )}
                      {msg.role === 'assistant' && msg.type === 'form' && msg.formSubmitted && (
                        <div className="mt-3 py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 border border-emerald-100">
                          Form Submitted ✓
                        </div>
                      )}
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
