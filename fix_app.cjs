const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const strToRemove = `export const formatSafeStr = (val: any, fmt: string) => {
  if (!val) return '';
  if (val.toDate) return format(val.toDate(), fmt);
  if (val.seconds) return format(new Date(val.seconds * 1000), fmt);
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return format(d, fmt);
};

`;

app = app.replace(strToRemove, "");

const formatSafeStrDef = `export const formatSafeStr = (val: any, fmt: string) => {
  if (!val) return '';
  if (val.toDate) return format(val.toDate(), fmt);
  if (val.seconds) return format(new Date(val.seconds * 1000), fmt);
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return format(d, fmt);
};

`;

// insert after imports, finding last import statement
let lastImportLine = app.lastIndexOf("import { auth, db } from './firebase';");
let endOfLastImport = app.indexOf('\n', lastImportLine);
app = app.slice(0, endOfLastImport + 1) + '\n' + formatSafeStrDef + app.slice(endOfLastImport + 1);

fs.writeFileSync('src/App.tsx', app);
