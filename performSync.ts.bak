  const performSync = async (url: string, silent: boolean = false) => {
    if (!url) return;
    if (syncLock.current) {
       console.log("Sync already in progress, skipping concurrent call");
       return;
    }
    syncLock.current = true;
    setIsSyncing(true);
    try {
      let fetchUrl = url.trim();
      
      // Auto-convert standard Google Sheets URLs to CSV export URLs
      if (fetchUrl.includes('docs.google.com/spreadsheets')) {
        let sheetId = "";
        let isPublished = false;

        // Pattern 1: Published to web links (/d/e/...)
        if (fetchUrl.includes("/d/e/")) {
          const eMatch = fetchUrl.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
          if (eMatch && eMatch[1]) {
            sheetId = eMatch[1];
            isPublished = true;
          }
        } 
        // Pattern 2: Standard sharing/editor links (/d/...)
        else if (fetchUrl.includes("/d/")) {
          const dMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (dMatch && dMatch[1]) {
            sheetId = dMatch[1];
          }
        }

        if (sheetId) {
          // Extract GID if present in the original URL (either as query param or hash fragment)
          const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
          let gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";
          
          // Self-healing: Aggressive replacement of the wrong GID with the correct one for the user's sheet.
          if (sheetId === '1LCCoy0A8YkI3wcKBeEYOxkDxEEkRtfnfXGOvuepFSC0') {
             if (!gidParam || gidParam.includes('131529049')) {
                gidParam = '&gid=1757141989'; // Force it to point to the correct tab.
             }
          }

          // If it's not already a CSV link, convert it to the clean export format
          const hasCsvParam = fetchUrl.includes('format=csv') || fetchUrl.includes('output=csv');
          
          if (!hasCsvParam) {
            if (isPublished) {
              fetchUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv${gidParam}`;
            } else {
              fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
            }
          } else {
            if (gidParam && !fetchUrl.includes('gid=')) {
              fetchUrl = fetchUrl + gidParam;
            } else if (fetchUrl.includes('gid=131529049') && gidParam === '&gid=1757141989') {
              fetchUrl = fetchUrl.replace('gid=131529049', 'gid=1757141989');
            }
          }
        }
        console.log(`[Sync] Requesting URL: ${fetchUrl}`);
      }

      let response;
      try {
        console.log(`[Sync] Attempting direct fetch: ${fetchUrl}`);
        // Try direct fetch first (works for most Google Sheets CSV exports due to CORS)
        response = await fetch(fetchUrl);
      } catch (directErr) {
        console.warn("[Sync] Direct fetch failed (likely CORS), falling back to proxy:", directErr);
        // Fallback to proxy if direct fetch fails (e.g. due to CORS or network issues)
        response = await fetch(BACKEND_URL + '/api/proxy/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: fetchUrl })
        });
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorMsg = errorJson.error || errorJson.message || errorMsg;
          } else {
            const errorText = await response.text();
            if (errorText.length > 200) {
              errorMsg = errorText.substring(0, 200) + '...';
            } else {
              errorMsg = errorText || errorMsg;
            }
          }
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        
        console.error(`Sync Error (${response.status}):`, errorMsg);
        throw new Error(`Failed to fetch Sheet (Status ${response.status}). Ensure it is "Published to web" as CSV.`);
      }
      const csvText = await response.text();
      
      if (csvText.trim().toLowerCase().startsWith('<!doctype') || csvText.trim().toLowerCase().startsWith('<html')) {
        throw new Error('Invalid Link');
      }
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        complete: async (results) => {
          try {
            const newLeads = results.data as any[];
            let addedCount = 0;
            
            if (newLeads.length === 0) {
              if (!silent) showToast('No data found in the CSV', 'info');
              setIsSyncing(false);
              syncLock.current = false;
              return;
            }
            
            // Fetch existing leads directly from Firestore to ensure we have the latest data
            const leadsSnapshot = await getDocs(collection(db, 'leads'));
            const currentLeads = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
            
            const syncDocRef = doc(db, 'settings', 'leadSync');
            const syncDocSnap = await getDoc(syncDocRef);
            const syncData = syncDocSnap.exists() ? syncDocSnap.data() : {};
            
            const isFirstRun = !Array.isArray(syncData.processedHashes);
            const processedHashesList = syncData.processedHashes || [];
            const processedCsvHashes = new Set(processedHashesList);
            const newProcessedHashes = new Set(processedHashesList);
            
            // Generate list of existing sync hashes once outside the loop for high efficiency
            const existingSyncHashes = new Set(currentLeads.map((l: any) => l.syncHash).filter(Boolean));
            
            for (const row of newLeads) {
              const email = String(row.email || row['email address'] || '').trim();
              const phone = String(row.phone_number || row['phone number'] || row.phone || row['contact number'] || '').trim();
              const name = String(row.full_name || row['full name'] || row.form_name || row['form name'] || row.name || 'Unknown').trim();
              const budget = String(row.budget || row.est_budget || row['est budget'] || row.max_budget || row['max budget'] || '').trim();
              const guests = String(row.guests || row.no_of_guests || row['no. of guests'] || row['no._of_guests'] || row['number of guests'] || row.number_of_guests || row.guest_count || row['guest count'] || '').trim();
              const city = String(row.city || row.location || row.area || '').trim();
              const bookingDate = String(row.booking_date || row['booking date'] || row.event_date || row['event date'] || row.date || '').trim();
              const bookingTime = String(row.booking_time || row['booking time'] || row.event_time || row['event time'] || row.time || '').trim();
              const createdTimeStr = String(row.created_time || row['created time'] || row.timestamp || '').trim();
              
              let createdAt: any = serverTimestamp();
              let parsedDate: Date | null = null;
              if (createdTimeStr) {
                parsedDate = new Date(createdTimeStr);
                if (!isNaN(parsedDate.getTime())) {
                  createdAt = parsedDate;
                }
              }
              
              const rowHash = `${email}-${phone}-${name}-${bookingDate}-${createdTimeStr}`;

              if (newProcessedHashes.has(rowHash)) continue;
              
              if (existingSyncHashes.has(rowHash)) {
                newProcessedHashes.add(rowHash);
                continue;
              }

              if (email || phone || name !== 'Unknown') {
                // Strict deduplication to prevent old leads appearing as New
                const historicalMatch = currentLeads.find((l: any) => {
                  const matchPhone = phone && phone.length > 5 && l.phone === phone;
                  const matchEmail = email && l.email === email;
                  const matchName = name && name !== 'Unknown' && l.name === name;
                  
                  // Strong identical match: At least 2 primary fields match perfectly
                  if ((matchPhone && matchName) || (matchEmail && matchName) || (matchPhone && matchEmail)) {
                    return true;
                  }
                  
                  // Fallback match: If phone or email match, check if creation timestamps perfectly align
                  // to prevent single-field hash mismatches from duplicating old DB entries.
                  if (matchPhone || matchEmail) {
                    if (parsedDate && !isNaN(parsedDate.getTime()) && l.createdAt && typeof l.createdAt.toMillis === 'function') {
                       const dbTime = l.createdAt.toMillis();
                       const diffHours = Math.abs(dbTime - parsedDate.getTime()) / 3600000;
                       if (diffHours < 48) return true;
                    } else {
                       return true; // Better safe than spamming duplicates if no date parseable
                    }
                  }
                  
                  return false;
                });

                if (historicalMatch) {
                   newProcessedHashes.add(rowHash);
                   existingSyncHashes.add(rowHash);
                   continue; // Skip creating a new one
                }

                await addDoc(collection(db, 'leads'), {
                  name,
                  email,
                  phone,
                  budget,
                  guests,
                  city,
                  bookingDate,
                  bookingTime,
                  status: 'new',
                  createdAt,
                  source: 'google_sheets',
                  syncHash: rowHash
                });
                
                currentLeads.push({ id: 'temp', email, phone, name, syncHash: rowHash } as any);
                newProcessedHashes.add(rowHash);
                existingSyncHashes.add(rowHash);
                addedCount++;
              }
            }

            // Save processed hashes, keeping the last 15000 to avoid hitting Firestore document size limits
            const hashArrayToSave = Array.from(newProcessedHashes).slice(-15000);
            try {
              await setDoc(syncDocRef, { ...syncData, csvUrl, processedHashes: hashArrayToSave });
            } catch (e) {
              console.warn("Failed to save sync settings tracking due to permissions. (Deduplication will still fall back to document syncHashes)");
            }
            
            setIsSyncing(false);
            syncLock.current = false;
            if (!silent || addedCount > 0) {
              showToast(`Synced ${addedCount} new leads from Google Sheets`, 'success');
            }
            if (!silent) setSyncModalOpen(false);
          } catch (err: any) {
            console.error("Error in PapaParse complete callback:", err);
            if (!silent) showToast(err.message || 'Error occurred during Leads Sync', 'error');
            setIsSyncing(false);
            syncLock.current = false;
          }
        },
        error: (error: any) => {
          console.error("CSV Parse Error:", error);
          if (!silent) showToast('Failed to parse CSV', 'error');
          setIsSyncing(false);
          syncLock.current = false;
        }
      });
    } catch (err: any) {
      console.error("Sync Error:", err);
      if (!silent) showToast(err.message || 'Failed to fetch Google Sheet', 'error');
      setIsSyncing(false);
      syncLock.current = false;
    }
  };
