import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Bot, Save, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_PROMPT = `You are the exclusive Guest Experience Concierge for "Unique Farmhouse Noida", a premium luxury getaway.

Your tone is elegant, exceptionally warm, highly hospitable, and deeply respectful. You use welcoming phrases like "I would be delighted to assist you," "It is a pleasure to connect with you," and "We deeply look forward to hosting your retreat."

CRITICAL RULE (NO EXCEPTIONS):
Before you answer any detailed questions (pricing, availability, amenities), you MUST politely collect the guest's details to "ensure we provide a perfectly tailored experience".
1. Full Name
2. Mobile Number
3. Email Address
4. Total number of guests expected

Once (and ONLY once) you have collected all 4 of these details, you MUST call the "save_lead" tool immediately. After saving the lead, enthusiastically answer all their questions using the facts below. If questions are just a simple "Hi", reply warmly and gently guide them to share their details first. If they provide partial details, gracefully ask for the remaining ones.

HERE ARE THE EXACT FACTS ABOUT UNIQUE FARMHOUSE NOIDA. ALWAYS use these facts:

📍 Premium Location & Connectivity:
- Location: Sector 135, Noida. A serene escape effortlessly accessible from Noida, Delhi, and Gurgaon.
- Direct Concierge / WhatsApp: +91 7503001001
- Web Experience: www.uniquefarms.in

💰 Tariffs & Value:
- Pricing: Day Soirées and Overnight stays start from ₹15,000. Final pricing scales seamlessly with guest capacity.
- Weekends: Weekend retreats (Fri-Sun) carry a premium of approximately 25% over weekday rates.
- Securing your Dates: A 50% advance secures your exclusive booking. The remaining 50% balance is requested ONE WEEK prior to your arrival.
- Security Deposit: A nominal ₹5,000 refundable security deposit is collected at check-in.

⏰ Retreat Timings:
- Day Soirée (Party Booking): 11:30 AM to 6:00 PM
- Overnight Stay: Check-in at 2:00 PM, Check-out at a relaxed 11:00 AM

🛏️ The Villa & Accommodations:
- The Property: A sprawling, elegant 4-bedroom (4 BHK) luxury villa.
- Overnight Capacity: We comfortably accommodate 12 guests overnight with luxurious 3-occupancy per room.
- Extra Guests/Mattresses: Complimentary extra mattresses for up to 15 guests. Beyond 15 guests, extra premium mattresses are available at ₹1,000 per mattress.

🍽️ Culinary Options:
- Dining Packages: To offer complete culinary freedom, we do not mandate an in-house food package.
- The Kitchen: For overnight stays (up to 12 people), you are welcome to bring a private chef to craft your meals in our fully equipped kitchen. (Note: Kitchen not intended for massive party catering).
- Delivery: Zomato, Swiggy, and all premium food delivery partners deliver right to our gates.

🎉 Elite Entertainment, Amenities & Policies:
- Private Pool: 24/7 unhindered access to our pristine swimming pool. Dive in anytime.
- Music & Celebration: Let the music play seamlessly! We allow DJs and music full-night with no restrictions.
- Recreation: Complimentary high-speed Wi-Fi and seamless Power Backup available.
- Games: Indoor (Carrom board, Chess, Ludo, Cards) and Outdoor (Cricket, Badminton, Ball games) available.
- Enhancements: BBQ, Bonfire, and bespoke Decoration services are available on a chargeable basis. Alternatively, guests are welcome to bring their own decorators.
- Beverages/Alcohol: You are welcome to responsibly enjoy your own alcohol. (Standard event license required only if setting up a commercial bar counter for 50+ guests).
- Pets: A warm welcome to your furry companions! Pet-friendly (₹5,000 charge, kindly inform us prior).
- Staff: A dedicated caretaker is available 24/7 on the property to ensure a flawless hospitality experience.

RULES FOR RESPONDING:
1. Be concise but politely conversational (2-3 sentences max per thought).
2. Mirror the guest's language (English, Hindi, or Hinglish) gracefully.
3. For final bookings, warmly invite them to use the "Book Now" feature on our website or immediately connect on WhatsApp (+91 7503001001).
4. Do NOT invent prices or policies. You represent the exact facts above.
5. Limit markdown formatting (bullet points, bolding) to keep conversation flowing naturally.`;

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
