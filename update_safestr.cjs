const fs = require('fs');
const newFormatSafeStr = `const formatSafeStr = (val: any, fmt: string) => {
  if (!val) return '';
  if (val.toDate) return format(val.toDate(), fmt);
  if (val.seconds) return format(new Date(val.seconds * 1000), fmt);
  
  if (typeof val === 'string') {
    const hasYear = /\\b\\d{4}\\b/.test(val);
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      if (!hasYear && d.getFullYear() === 2001 && !val.includes('2001')) {
        d.setFullYear(new Date().getFullYear());
      }
      return format(d, fmt);
    }
  }

  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return format(d, fmt);
};`;

const newFormatSafeStrExport = newFormatSafeStr.replace('const formatSafeStr', 'export const formatSafeStr');

// App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/export const formatSafeStr = \(val: any, fmt: string\) => \{[\s\S]*?\n\};\n/g, newFormatSafeStrExport + "\n");
fs.writeFileSync('src/App.tsx', appContent);

// ElegantLeadsDashboard.tsx
let elContent = fs.readFileSync('src/ElegantLeadsDashboard.tsx', 'utf8');
elContent = elContent.replace(/const formatSafeStr = \(val: any, fmt: string\) => \{[\s\S]*?\n\};\n/g, newFormatSafeStr + "\n");
fs.writeFileSync('src/ElegantLeadsDashboard.tsx', elContent);
