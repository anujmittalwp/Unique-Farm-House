import fetch from 'node-fetch';
import Papa from 'papaparse';

async function main() {
  const targetUrl = 'https://docs.google.com/spreadsheets/d/1LCCoy0A8YkI3wcKBeEYOxkDxEEkRtfnfXGOvuepFSC0/export?format=csv&gid=1757141989';
  console.log("Fetching correct sheet without GID:", targetUrl);
  
  try {
    const response = await fetch(targetUrl);
    console.log("Response Status:", response.status, response.statusText);
    
    const csvText = await response.text();
    console.log("Received CSV Size:", csvText.length, "bytes");
    
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const rows = results.data as any[];
        console.log(`Parsed ${rows.length} rows!`);
        if (rows.length > 0) {
          console.log("\nLast 10 rows in the Google Sheet:");
          rows.slice(-10).forEach((row, idx) => {
            const name = row.name || row['full name'] || row.full_name || '';
            const email = row.email || '';
            const phone = row.phone || row['phone number'] || row.phone_number || '';
            const date = row.date || row.booking_date || '';
            console.log(`  [Row ${rows.length - 9 + idx}] Name: "${name}"`);
          });
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
}

main();
