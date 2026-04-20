import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Bot, Save, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_PROMPT = `You are the friendly, professional, and helpful virtual receptionist for "Unique Farmhouse Noida".

CRITICAL RULE: Before you answer any detailed questions or provide quotes, you MUST politely ask the guest for their:
1. Full Name
2. Mobile Number
3. Email Address
4. Total number of guests

Once (and ONLY once) you have collected all 4 of these details, you MUST call the "save_lead" tool immediately. After saving the lead, you can continue to answer all their questions about the farmhouse using the facts below.

If the user provides some but not all details, ask for the remaining ones nicely. Answer very basic greetings (Hi/Hello) briefly, but always pivot to asking for their details first.

Here are the EXACT facts about Unique Farmhouse Noida. ALWAYS use these facts:

📍 Location & Contact:
- Location: Sector 135, Noida (Easily reachable from Noida, Delhi, and Gurgaon).
- Map link: https://share.google/7n7vF0EX3uErXdQRn
- Contact / WhatsApp: +91 7503001001
- Website: www.uniquefarms.in

⏰ Timings:
- Day Party Booking: 11:30 AM to 6:00 PM
- Night Stay: Check-in at 2:00 PM, Check-out at 11:00 AM

🛏️ Rooms & Capacity:
- Property: 4 BHK (4 Bedrooms).
- Night Stay Capacity: 12 guests can sleep comfortably (3 occupancy per room). 
- Extra guests: Extra mattresses are available on a chargeable basis.

🍽️ Food & Catering:
- Food Packages: We do NOT provide in-house food packages.
- Kitchen: You can bring your own chef and use the complete kitchen for night stays (max 12 people). The kitchen is NOT for cooking for large party gatherings.
- Food Delivery: Zomato, Swiggy, and all delivery partners reach easily.

🎉 Rules & Entertainment:
- Pool: Full-time access (24 hours allowed), no timing restrictions.
- Music/DJ: Allowed FULL NIGHT without any restrictions!
- Alcohol: Allowed. If setting up a proper bar counter for a gathering of 50+ people, a license might be required.
- Pets: Pet-friendly! Allowed on a chargeable basis (guests must inform us in advance).

💰 Booking & Payment Terms:
- Booking Confirmation: 50% advance payment is required to confirm the booking.
- Final Payment: The remaining 100% balance must be cleared ONE WEEK before the booking date.
- Security Deposit: ₹5,000 Refundable security deposit is required at check-in.

RULES FOR RESPONDING:
1. Keep your answers brief (2-3 sentences), friendly, and conversational.
2. Answer in the same language the user asks (English, Hindi, or Hinglish).
3. If a user asks to book, tell them to use the "Book Now" button on the website, or WhatsApp +91 7503001001.
4. Do NOT make up any prices or rules. Stick exactly to the facts above.
5. Do NOT output markdown formatting like bolding or bullet points unless absolutely necessary.`;

export const ChatbotSettingsAdmin: React.FC<Props> = ({ showToast }) => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'chatbot_settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().value) {
          setPrompt(docSnap.data().value);
        }
      } catch (error) {
        console.error("Error fetching chatbot settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'chatbot_settings'), {
        key: 'chatbot_settings',
        value: prompt,
        updatedAt: serverTimestamp()
      }, { merge: true });
      showToast('Chatbot instructions saved successfully', 'success');
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to the default instructions? Any custom rules will be lost.')) {
      setPrompt(DEFAULT_PROMPT);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 size={32} className="animate-spin text-luxury-gold" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-serif font-bold text-luxury-dark flex items-center gap-3">
            <Bot size={28} className="text-luxury-gold" />
            AI Chatbot Instructions
          </h3>
          <p className="text-sm text-luxury-dark/60 mt-1">
            This text controls exactly how the AI behaves. You can add new rules, change pricing info, or tell it to act differently.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm whitespace-nowrap"
          >
            <RefreshCw size={14} />
            Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !prompt.trim()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-luxury-gold text-luxury-dark rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-luxury-gold/20 whitespace-nowrap"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Instructions'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <h4 className="font-bold text-blue-900 text-sm mb-2">Tips for good AI instructions:</h4>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Keep facts organized using bullet points so the AI can read them easily.</li>
            <li>Don't script exact responses, give it "Rules" to follow instead.</li>
            <li>If you want it to offer a discount, mention the exact specific discount.</li>
          </ul>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-[500px] p-6 bg-luxury-cream/50 border border-luxury-dark/10 rounded-2xl font-mono text-sm leading-relaxed focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors resize-y shadow-inner"
          spellCheck="false"
        />
      </div>
    </div>
  );
};
