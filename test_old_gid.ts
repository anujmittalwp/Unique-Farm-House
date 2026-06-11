import fetch from 'node-fetch';
import Papa from 'papaparse';

async function main() {
  const targetUrl = 'https://docs.google.com/spreadsheets/d/1LCCoy0A8YkI3wcKBeEYOxkDxEEkRtfnfXGOvuepFSC0/export?format=csv&gid=131529049';
  const response = await fetch(targetUrl);
  const csvText = await response.text();
  
  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
    complete: (results) => {
      const rows = results.data as any[];
      const g = rows.find(r => r.full_name?.toLowerCase().includes('gaurav'));
      console.log("Found in 131529049?", !!g);
    }
  });
}

main();
