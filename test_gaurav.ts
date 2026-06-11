import fetch from 'node-fetch';
import Papa from 'papaparse';

async function main() {
  const targetUrl = 'https://docs.google.com/spreadsheets/d/1LCCoy0A8YkI3wcKBeEYOxkDxEEkRtfnfXGOvuepFSC0/export?format=csv&gid=1757141989';
  const response = await fetch(targetUrl);
  const csvText = await response.text();
  
  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
    complete: (results) => {
      const rows = results.data as any[];
      const gauravIndex = rows.findIndex(r => r.full_name?.toLowerCase().includes('gaurav bhatt'));
      console.log(`Gaurav Bhatt is at Row ${gauravIndex + 2} (header is row 1)`);
      if (gauravIndex !== -1) {
        console.log("Next leads:");
        rows.slice(gauravIndex, gauravIndex + 10).forEach(r => console.log(r.full_name, r.created_time));
      }
    }
  });
}

main();
