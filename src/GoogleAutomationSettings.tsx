import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, serverTimestamp, collection, query, where, getDocs, orderBy, updateDoc, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Bot, Save, Settings, MessageSquare, Image as ImageIcon, AlertCircle, Check, X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAI, safeAiCall } from './lib/ai';

export const GoogleAutomationSettings = ({ showToast, canEditSettingsAdmin }: { showToast: any, canEditSettingsAdmin: boolean }) => {
  const [settings, setSettings] = useState<any>({
    autoReplyEnabled: false,
    replyMode: 'auto', // 'auto' | 'manual'
    autoReplyPrompt: 'Write a polite, professional, and appreciative reply to this customer review for our farmhouse. Keep it under 2 sentences.',
    autoPostEnabled: false,
    postMode: 'auto', // 'auto' | 'manual'
    autoPostPrompt: 'Write an engaging short social media post about our luxury farmhouse for today. Include emojis and a welcoming tone.',
    locationId: '',
    credentialsJson: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  
  // Option 2: Manual Review State
  const [manualReviewerName, setManualReviewerName] = useState('');
  const [manualRating, setManualRating] = useState(5);
  const [manualComment, setManualComment] = useState('');
  const [isGeneratingManual, setIsGeneratingManual] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'google_automation'), (doc) => {
      if (doc.exists()) {
        setSettings((prev: any) => ({ ...prev, ...doc.data() }));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'automation_queue'), where('status', '==', 'pending'));
    const unsubQ = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      items.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tB - tA; // desc
      });
      setPendingItems(items);
    });
    return () => unsubQ();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'google_automation'), {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      showToast('Automation settings saved successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to save automation settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'automation_queue', id), {
        status: 'approved',
        updatedAt: serverTimestamp()
      });
      showToast('Approved successfully. The backend will process this shortly.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to approve', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'automation_queue', id), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
      showToast('Rejected successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to reject', 'error');
    }
  };

  const handleGenerateManualReply = async () => {
    if (!manualReviewerName.trim()) {
      showToast('Please enter the reviewer name.', 'error');
      return;
    }
    
    setIsGeneratingManual(true);
    try {
      showToast('Generating AI reply...', 'info');
      const ai: any = getAI();
      const prompt = `${settings.autoReplyPrompt || 'Write a polite, professional, and appreciative reply to this customer review for our farmhouse. Keep it under 2 sentences.'}
      
      Reviewer Name: ${manualReviewerName}
      Star Rating: ${manualRating}
      Comment: "${manualComment || 'Left a star rating without comment.'}"`;

      const response = await safeAiCall(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      }));
      
      const replyText = response.text?.trim();
      
      if (replyText) {
        await addDoc(collection(db, 'automation_queue'), {
          type: 'review_reply',
          reviewId: `manual_${Date.now()}`,
          reviewData: {
            reviewerName: manualReviewerName,
            starRating: manualRating,
            comment: manualComment
          },
          generatedContent: replyText,
          status: settings.replyMode === 'auto' ? 'approved' : 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        showToast('Successfully generated and queued manual reply!', 'success');
        setManualReviewerName('');
        setManualComment('');
        setManualRating(5);
      }
    } catch (error: any) {
      console.error('Manual generation error:', error);
      showToast(error.message || 'Failed to generate manual reply', 'error');
    } finally {
      setIsGeneratingManual(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/business.manage');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        showToast('Successfully authenticated with Google!', 'success');
        setSettings({...settings, googleAccessToken: token});
        // Auto-save the token
        await updateDoc(doc(db, 'settings', 'google_automation'), {
          googleAccessToken: token,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error(error);
      showToast('Failed to authenticate with Google: ' + error.message, 'error');
    }
  };

  const fetchAndGenerate = async () => {
    if (!settings.locationId) {
      showToast('Please enter your Google Business Location ID first.', 'error');
      return;
    }
    if (!settings.credentialsJson && !settings.googleAccessToken) {
      showToast('Please provide Credentials JSON (Option 1) or Sign in with Google (Option 2).', 'error');
      return;
    }
    
    setIsFetching(true);
    try {
      showToast('Checking Google for new reviews...', 'info');
      // In a real environment, you'd want to use the backend URL if separate, 
      // but here we just hit the local API path since we're using Express full-stack.
      const res = await fetch('/api/automation/google/sync-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: settings.locationId,
          credentialsJson: settings.credentialsJson,
          accessToken: settings.googleAccessToken
        })
      });

      const data = await res.json();
      
      let reviewsToProcess: any[] = [];
      
      if (!res.ok || data.isApiError) {
        throw new Error(data.error || 'Failed to sync reviews');
      } else {
        reviewsToProcess = data.reviews || [];
      }

      if (reviewsToProcess.length === 0) {
        showToast('No new unreplied reviews found.', 'success');
        return;
      }

      showToast(`Found ${reviewsToProcess.length} pending reviews. Generating AI replies...`, 'info');
      
      const ai: any = getAI();
      let generatedCount = 0;
      
      for (const review of reviewsToProcess) {
        // Check if we already have this review in queue
        const existingQ = query(collection(db, 'automation_queue'), where('reviewId', '==', review.reviewId));
        const existingDocs = await getDocs(existingQ);
        if (!existingDocs.empty) continue; // Skip if already processing

        // Generate reply using AI
        try {
          const prompt = `${settings.autoReplyPrompt || 'Write a polite, professional, and appreciative reply to this customer review for our farmhouse. Keep it under 2 sentences.'}
          
          Reviewer Name: ${review.reviewer?.displayName || 'Customer'}
          Star Rating: ${review.starRating}
          Comment: "${review.comment || 'Left a star rating without comment.'}"`;

          const response = await safeAiCall(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          }));
          
          const replyText = response.text?.trim();
          
          if (replyText) {
            await addDoc(collection(db, 'automation_queue'), {
              type: 'review_reply',
              reviewId: review.reviewId,
              reviewData: {
                reviewerName: review.reviewer?.displayName || 'Customer',
                starRating: review.starRating === 'FIVE' ? 5 : review.starRating === 'FOUR' ? 4 : review.starRating === 'THREE' ? 3 : review.starRating === 'TWO' ? 2 : 1,
                comment: review.comment || ''
              },
              generatedContent: replyText,
              status: settings.replyMode === 'auto' ? 'approved' : 'pending',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            generatedCount++;
          }
        } catch (e) {
          console.error('Failed to generate AI reply for review', e);
        }
      }
      
      showToast(`Successfully queued ${generatedCount} AI replies for manual approval!`, 'success');
    } catch (error: any) {
      console.error('Sync error:', error);
      showToast(error.message || 'Failed to sync reviews', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-serif font-bold text-luxury-dark flex items-center gap-2">
            <Bot className="text-luxury-gold" /> Google Business Automation
          </h3>
          <p className="text-sm text-luxury-dark/60 mt-1">Configure AI-powered auto-replies for Google Reviews and daily posts.</p>
        </div>
        {canEditSettingsAdmin && (
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAndGenerate}
              disabled={isFetching || isSaving || !settings.locationId || (!settings.credentialsJson && !settings.googleAccessToken)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-luxury-dark rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 border border-luxury-dark/10 shadow-sm"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              {isFetching ? 'Fetching...' : 'Fetch Reviews'}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-luxury-gold/20"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-luxury-gold/10 border border-luxury-gold/30 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="text-luxury-gold shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-luxury-dark">
          <p className="font-bold mb-1">Google Business API Integration</p>
          <p className="opacity-80">To enable these features, you must provide your Google Business Profile Location ID and Service Account Credentials JSON. The backend server will automatically check for new reviews every hour and publish daily posts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Credentials Section */}
        <div className="bg-white/60 p-6 rounded-2xl border border-luxury-dark/5 space-y-4 shadow-sm">
          <h4 className="font-bold flex items-center gap-2 text-luxury-dark"><Settings size={18} /> API Configuration</h4>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">Google Business Location ID (Required)</label>
              <input 
                type="text" 
                value={settings.locationId || ''}
                onChange={(e) => setSettings({...settings, locationId: e.target.value})}
                placeholder="e.g. 12345678901234567890"
                className="w-full px-4 py-2 bg-white rounded-xl text-sm border border-luxury-dark/10 focus:border-luxury-gold outline-none"
                disabled={!canEditSettingsAdmin}
              />
            </div>
            
            <div className="border-t border-luxury-dark/5 pt-4">
              <p className="text-sm font-bold text-luxury-dark mb-2">Option 1: Login with Google (Recommended)</p>
              <p className="text-xs text-luxury-dark/60 mb-3">Sign in directly with your Google account to authorize access to your Google Business Profile. This is the easiest method.</p>
              
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#4285F4] text-white rounded-xl text-sm font-bold hover:bg-[#3367D6] transition-all shadow-sm"
              >
                <div className="bg-white p-1 rounded-full shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                {settings.googleAccessToken ? 'Authenticated with Google' : 'Sign in with Google'}
              </button>
              {settings.googleAccessToken && <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1"><Check size={12}/> Connected</p>}
            </div>

            <div className="border-t border-luxury-dark/5 pt-4">
              <p className="text-sm font-bold text-luxury-dark mb-2">Option 2: Service Account Credentials JSON (Advanced)</p>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">Paste JSON Here</label>
              <textarea 
                value={settings.credentialsJson || ''}
                onChange={(e) => setSettings({...settings, credentialsJson: e.target.value})}
                placeholder='{"type": "service_account", "project_id": "..."}'
                rows={4}
                className="w-full px-4 py-2 bg-white rounded-xl text-sm border border-luxury-dark/10 focus:border-luxury-gold outline-none font-mono"
                disabled={!canEditSettingsAdmin}
              />
            </div>
          </div>
        </div>

        {/* Option 3: Manual Review AI Generator */}
        <div className="bg-white/60 p-6 rounded-2xl border border-luxury-dark/5 space-y-4 shadow-sm">
          <h4 className="font-bold flex items-center gap-2 text-luxury-dark"><Bot size={18} /> Option 3: Manual AI Reply Generator</h4>
          <p className="text-xs text-luxury-dark/60">If automatic fetching fails, paste your pending reviews here to generate an AI reply manually.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">Reviewer Name</label>
              <input 
                type="text" 
                value={manualReviewerName}
                onChange={(e) => setManualReviewerName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2 bg-white rounded-xl text-sm border border-luxury-dark/10 focus:border-luxury-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">Star Rating</label>
              <select 
                value={manualRating}
                onChange={(e) => setManualRating(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white rounded-xl text-sm border border-luxury-dark/10 focus:border-luxury-gold outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                <option value={4}>⭐⭐⭐⭐ (4)</option>
                <option value={3}>⭐⭐⭐ (3)</option>
                <option value={2}>⭐⭐ (2)</option>
                <option value={1}>⭐ (1)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">Review Comment (Optional)</label>
              <textarea 
                value={manualComment}
                onChange={(e) => setManualComment(e.target.value)}
                placeholder="Paste the review text here..."
                rows={2}
                className="w-full px-4 py-2 bg-white rounded-xl text-sm border border-luxury-dark/10 focus:border-luxury-gold outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button 
              onClick={handleGenerateManualReply}
              disabled={isGeneratingManual || !manualReviewerName.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all disabled:opacity-50"
            >
              {isGeneratingManual ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
              {isGeneratingManual ? 'Generating...' : 'Generate AI Reply'}
            </button>
          </div>
        </div>

        {/* Pending Approvals Section */}
        {pendingItems.length > 0 && (
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 space-y-4 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 text-amber-900"><Bot size={18} /> Pending Manual Approvals ({pendingItems.length})</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {pendingItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          {item.type === 'review_reply' ? 'Review Reply' : 'Social Post'}
                        </span>
                        <span className="text-[10px] text-luxury-dark/50">
                          {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleString() : ''}
                        </span>
                      </div>
                      
                      {item.type === 'review_reply' && item.reviewData && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                          <p className="font-bold text-luxury-dark mb-1">{item.reviewData.reviewerName} <span className="text-yellow-500">{'★'.repeat(item.reviewData.starRating || 5)}</span></p>
                          <p className="text-luxury-dark/70 italic">"{item.reviewData.comment}"</p>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">Generated {item.type === 'review_reply' ? 'Reply' : 'Post'}:</p>
                        <p className="text-sm text-luxury-dark bg-blue-50/50 p-3 rounded-lg border border-blue-100">{item.generatedContent}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleApprove(item.id)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                        <Check size={14} /> Approve
                      </button>
                      <button onClick={() => handleReject(item.id)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto Reply Section */}
        <div className="bg-white/60 p-6 rounded-2xl border border-luxury-dark/5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="font-bold flex items-center gap-2 text-luxury-dark"><MessageSquare size={18} /> AI Auto-Reply to Reviews</h4>
            <div className="flex items-center gap-4">
              {settings.autoReplyEnabled && (
                <div className="flex bg-luxury-dark/5 p-1 rounded-lg">
                  <button
                    onClick={() => setSettings({...settings, replyMode: 'manual'})}
                    disabled={!canEditSettingsAdmin}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${settings.replyMode === 'manual' ? 'bg-white text-luxury-dark shadow-sm' : 'text-luxury-dark/50 hover:text-luxury-dark'}`}
                  >
                    Manual Approval
                  </button>
                  <button
                    onClick={() => setSettings({...settings, replyMode: 'auto'})}
                    disabled={!canEditSettingsAdmin}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${settings.replyMode !== 'manual' ? 'bg-white text-luxury-dark shadow-sm' : 'text-luxury-dark/50 hover:text-luxury-dark'}`}
                  >
                    Fully Auto
                  </button>
                </div>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.autoReplyEnabled || false}
                  onChange={(e) => setSettings({...settings, autoReplyEnabled: e.target.checked})}
                  disabled={!canEditSettingsAdmin}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
              </label>
            </div>
          </div>
          <p className="text-xs text-luxury-dark/60">When enabled, the system will generate replies to 4 & 5-star reviews using Gemini AI.</p>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">AI System Prompt for Replies</label>
            <textarea 
              value={settings.autoReplyPrompt || ''}
              onChange={(e) => setSettings({...settings, autoReplyPrompt: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 bg-white rounded-xl text-sm border border-luxury-dark/10 focus:border-luxury-gold outline-none"
              disabled={!canEditSettingsAdmin}
            />
          </div>
        </div>

        {/* Auto Post Section */}
        <div className="bg-white/60 p-6 rounded-2xl border border-luxury-dark/5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="font-bold flex items-center gap-2 text-luxury-dark"><ImageIcon size={18} /> AI Daily Posts</h4>
            <div className="flex items-center gap-4">
              {settings.autoPostEnabled && (
                <div className="flex bg-luxury-dark/5 p-1 rounded-lg">
                  <button
                    onClick={() => setSettings({...settings, postMode: 'manual'})}
                    disabled={!canEditSettingsAdmin}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${settings.postMode === 'manual' ? 'bg-white text-luxury-dark shadow-sm' : 'text-luxury-dark/50 hover:text-luxury-dark'}`}
                  >
                    Manual Approval
                  </button>
                  <button
                    onClick={() => setSettings({...settings, postMode: 'auto'})}
                    disabled={!canEditSettingsAdmin}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${settings.postMode !== 'manual' ? 'bg-white text-luxury-dark shadow-sm' : 'text-luxury-dark/50 hover:text-luxury-dark'}`}
                  >
                    Fully Auto
                  </button>
                </div>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.autoPostEnabled || false}
                  onChange={(e) => setSettings({...settings, autoPostEnabled: e.target.checked})}
                  disabled={!canEditSettingsAdmin}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
              </label>
            </div>
          </div>
          <p className="text-xs text-luxury-dark/60">When enabled, the system will generate a daily post about the farmhouse.</p>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-luxury-dark/50 mb-1">AI System Prompt for Posts</label>
            <textarea 
              value={settings.autoPostPrompt || ''}
              onChange={(e) => setSettings({...settings, autoPostPrompt: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 bg-white rounded-xl text-sm border border-luxury-dark/10 focus:border-luxury-gold outline-none"
              disabled={!canEditSettingsAdmin}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

