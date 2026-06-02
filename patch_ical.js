const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const iCalComponent = `
const ICalSyncSettings = ({ showToast, canEditSettingsAdmin }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void, canEditSettingsAdmin?: boolean }) => {
  const [urls, setUrls] = React.useState<{ id: string, name: string, url: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [newUrl, setNewUrl] = React.useState({ name: '', url: '' });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'calendar_sync');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUrls(docSnap.data().urls || []);
        }
      } catch (error) {
        console.error('Error fetching sync settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAddUrl = async () => {
    if (!newUrl.name || !newUrl.url) {
      showToast('Please fill in both name and URL', 'error');
      return;
    }
    const newId = Date.now().toString();
    const updatedUrls = [...urls, { ...newUrl, id: newId }];
    try {
      await setDoc(doc(db, 'settings', 'calendar_sync'), { urls: updatedUrls }, { merge: true });
      setUrls(updatedUrls);
      setNewUrl({ name: '', url: '' });
      showToast('Import URL added successfully', 'success');
    } catch (error) {
      showToast('Failed to add Import URL', 'error');
    }
  };

  const handleRemoveUrl = async (idToRemove: string) => {
    if (!window.confirm('Are you sure you want to remove this sync URL?')) return;
    const updatedUrls = urls.filter(u => u.id !== idToRemove);
    try {
      await setDoc(doc(db, 'settings', 'calendar_sync'), { urls: updatedUrls }, { merge: true });
      setUrls(updatedUrls);
      showToast('Import URL removed', 'success');
    } catch (error) {
      showToast('Failed to remove Import URL', 'error');
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch((import.meta.env.VITE_BACKEND_URL || window.location.origin) + '/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      if (!response.ok) throw new Error('Sync failed');
      showToast('Calendar successfully synced!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Manual sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-3xl p-8 rounded-3xl border border-luxury-dark/5 shadow-sm space-y-8">
      <div>
        <h3 className="text-2xl font-serif font-bold text-luxury-dark">iCal Sync Settings</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mt-1">Manage Calendar Import & Export URLs</p>
      </div>

      {loading ? (
        <div className="text-center py-6 text-luxury-dark border border-luxury-dark/10 rounded-2xl bg-luxury-dark/5">
          <RefreshCw size={24} className="animate-spin mx-auto text-luxury-gold mb-2" />
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Loading iCal settings...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-luxury-cream/20 p-6 rounded-2xl border border-luxury-dark/5 space-y-4">
            <h4 className="font-bold text-luxury-dark uppercase tracking-widest text-xs flex items-center gap-2">
              <Upload size={14} className="text-luxury-gold" /> Export Calendar URL
            </h4>
            <p className="text-sm text-luxury-dark/60">
              Provide this URL to external websites (like Airbnb, MakeMyTrip) so they can block their calendars based on your bookings.
            </p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={(import.meta.env.VITE_BACKEND_URL || window.location.origin) + '/calendar.ics'} 
                className="w-full bg-white px-4 py-3 border border-luxury-dark/10 rounded-xl text-sm outline-none text-luxury-dark" 
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText((import.meta.env.VITE_BACKEND_URL || window.location.origin) + '/calendar.ics');
                  showToast('Export URL copied to clipboard', 'info');
                }}
                className="bg-luxury-gold text-white p-3 rounded-xl hover:bg-luxury-dark transition-colors"
                title="Copy to clipboard"
              >
                <ClipboardList size={18} />
              </button>
            </div>
          </div>

          <div className="bg-luxury-cream/20 p-6 rounded-2xl border border-luxury-dark/5 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-luxury-dark uppercase tracking-widest text-xs flex items-center gap-2">
                <Download size={14} className="text-luxury-gold" /> Import iCal URLs
              </h4>
              <button
                disabled={syncing || urls.length === 0}
                onClick={handleManualSync}
                className="flex items-center gap-2 px-4 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50"
              >
                {syncing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
            
            <p className="text-sm text-luxury-dark/60 mb-2">
              Add the iCal URLs provided by external websites here. Our system will periodically sync them and block those dates in your calendar.
            </p>
            
            {urls.length > 0 ? (
              <ul className="space-y-3 mb-6">
                {urls.map((u, i) => (
                  <li key={u.id || i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-luxury-dark/5">
                    <div>
                      <p className="font-bold text-sm text-luxury-dark">{u.name}</p>
                      <p className="text-xs text-luxury-dark/60 truncate max-w-[200px] sm:max-w-xs">{u.url}</p>
                    </div>
                    {canEditSettingsAdmin && (
                      <button onClick={() => handleRemoveUrl(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-luxury-dark/40 italic mb-6">No import URLs configured.</p>
            )}

            {canEditSettingsAdmin && (
              <div className="pt-4 border-t border-luxury-dark/10 grid grid-cols-1 sm:grid-cols-12 gap-3">
                 <div className="sm:col-span-3">
                   <input
                     type="text"
                     placeholder="Name (e.g. Airbnb)"
                     value={newUrl.name}
                     onChange={(e) => setNewUrl({ ...newUrl, name: e.target.value })}
                     className="w-full bg-white px-4 py-3 border border-luxury-dark/10 rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none"
                   />
                 </div>
                 <div className="sm:col-span-7">
                   <input
                     type="url"
                     placeholder="iCal Import URL"
                     value={newUrl.url}
                     onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
                     className="w-full bg-white px-4 py-3 border border-luxury-dark/10 rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none"
                   />
                 </div>
                 <div className="sm:col-span-2">
                   <button 
                     onClick={handleAddUrl}
                     className="w-full bg-luxury-gold text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-luxury-dark transition-all flex items-center justify-center gap-2"
                   >
                     <Plus size={16} /> Add
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
`;

if (!content.includes('ICalSyncSettings =')) {
  content = content.replace(/const App = \(\) => \{/, iCalComponent + '\n\nconst App = () => {');
}

content = content.replace(/\| 'coupons' \| 'partners'>/, "| 'coupons' | 'partners' | 'ical'>");
content = content.replace(/\| 'chatbot_settings' \| 'users'>/, "| 'chatbot_settings' | 'users' | 'ical'>");
content = content.replace(/\['settings', 'reviews', 'gallery', 'logs', 'migration', 'notifications', 'coupons'\]/, "['settings', 'reviews', 'gallery', 'logs', 'migration', 'notifications', 'coupons', 'ical']");

if (!content.includes("id: 'ical'")) {
    content = content.replace(/\{ id: 'migration', filter: 'migration'.*?\},/, "{ id: 'migration', filter: 'migration', label: 'Import/Export', labelShort: 'Tool', permission: 'leadsSettings' },\n    { id: 'ical', filter: 'ical', label: 'iCal Calendar', labelShort: 'iCal', permission: 'editSettings' },");
}

const renderStr = `        ) : (activeFilter === 'partners' && (userRole === 'admin' || userRole === 'agent')) ? (`;

const iCalRenderStr = `        ) : (activeFilter === 'ical' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8 animate-fade-in">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            <div className="bg-white/60 backdrop-blur-3xl p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <ICalSyncSettings showToast={showToast} canEditSettingsAdmin={canEditSettingsAdmin} />
            </div>
          </div>
        ) : (activeFilter === 'partners' && (userRole === 'admin' || userRole === 'agent')) ? (`;

if (!content.includes("activeFilter === 'ical'")) {
    content = content.replace(renderStr, iCalRenderStr);
}

fs.writeFileSync('src/App.tsx', content);

