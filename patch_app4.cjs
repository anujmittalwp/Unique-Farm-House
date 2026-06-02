const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const newHandleManualSync = `  const handleManualSync = async () => {
    setSyncing(true);
    try {
      // Direct call to Cloudflare worker to bypass IP blocking
      const workerUrl = 'https://calender.a9812275402.workers.dev/api/calendar/sync';
      let response;
      try {
        response = await fetch(workerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls })
        });
      } catch (e) {
        // Fallback to Express backend
        response = await fetch((import.meta.env.VITE_BACKEND_URL || window.location.origin) + '/api/calendar/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls })
        });
      }
      
      if (!response.ok) throw new Error('Sync failed');
      const data = await response.json();
      
      if (data.events && Array.isArray(data.events)) {
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
          try {
            let checkInStr = ev.checkIn;
            let checkOutStr = ev.checkOut;
            
            // if server returned start/end objects
            if (!checkInStr && ev.start) {
              const startDate = new Date(ev.start);
              checkInStr = \`\${String(startDate.getDate()).padStart(2, '0')}/\${String(startDate.getMonth() + 1).padStart(2, '0')}/\${startDate.getFullYear()}\`;
            }
            if (!checkOutStr && ev.end) {
              const endDate = new Date(ev.end);
              checkOutStr = \`\${String(endDate.getDate()).padStart(2, '0')}/\${String(endDate.getMonth() + 1).padStart(2, '0')}/\${endDate.getFullYear()}\`;
            }
            
            if (!checkInStr || !checkOutStr) return;
            
            const newDocRef = doc(collection(db, 'blocked_dates'));
            batch.set(newDocRef, { 
              checkIn: checkInStr,
              checkOut: checkOutStr,
              type: 'external',
              source: ev.source || 'Sync',
              uid: ev.uid || '',
              status: 'confirmed', 
              guestName: ev.summary || 'OTA Booking' 
            });
            count++;
            if (count >= 400) {
              batch.commit();
              batch = writeBatch(db);
              count = 0;
            }
          } catch(e) {
            console.error("error formatting date", e);
          }
        });
        
        if (count > 0) {
          await batch.commit();
        }
      }
      
      const now = new Date();
      await setDoc(doc(db, 'settings', 'calendar_sync'), { lastSynced: now }, { merge: true });
      setLastSynced(now);
      
      showToast(\`Calendar successfully synced! Found \${data.events ? data.events.length : 0} events.\`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Manual sync failed - Please check your Cloudflare Worker is updated.', 'error');
    } finally {
      setSyncing(false);
    }
  };`;

content = content.replace(/  const handleManualSync = async \(\) => \{[\s\S]*?finally \{\s*setSyncing\(false\);\s*\}\s*\};/, newHandleManualSync);

fs.writeFileSync('src/App.tsx', content);
