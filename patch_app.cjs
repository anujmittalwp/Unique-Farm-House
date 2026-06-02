const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const newHandleManualSync = `  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch((import.meta.env.VITE_BACKEND_URL || window.location.origin) + '/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      if (!response.ok) throw new Error('Sync failed');
      const data = await response.json();
      
      if (data.success && data.events) {
        // Find existing external blocked dates
        const qBlocked = query(collection(db, 'blocked_dates'), where('type', '==', 'external'));
        const blockedSnap = await getDocs(qBlocked);
        
        let batch = writeBatch(db);
        let count = 0;
        
        // Delete old external dates
        blockedSnap.docs.forEach(d => {
          batch.delete(d.ref);
          count++;
          if (count >= 400) {
            batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        });
        
        // Add new events
        data.events.forEach(ev => {
          const newDocRef = doc(collection(db, 'blocked_dates'));
          batch.set(newDocRef, { ...ev, status: 'confirmed', guestName: ev.guestName || 'OTA Booking' });
          count++;
          if (count >= 400) {
            batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        });
        
        if (count > 0) {
          await batch.commit();
        }
      }
      
      const now = new Date();
      await setDoc(doc(db, 'settings', 'calendar_sync'), { lastSynced: now }, { merge: true });
      setLastSynced(now);
      
      showToast('Calendar successfully synced!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Manual sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };`;

content = content.replace(/  const handleManualSync = async \(\) => \{[\s\S]*?finally \{\s*setSyncing\(false\);\s*\}\s*\};/, newHandleManualSync);

fs.writeFileSync('src/App.tsx', content);
