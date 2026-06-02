const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove CalendarSync component
content = content.replace(/const CalendarSync = \(.*?\}\s*\n\s*\};\s*\n/s, '');

// 2. Remove the Calendar Sync tab from SettingsSubNav
content = content.replace(/\s*\{\s*id:\s*'sync',\s*filter:\s*'sync',\s*label:\s*'Calendar Sync'.*?\},/g, '');

// 3. Remove "sync" from activeFilter and settingsFilter type literals
content = content.replace(/'sync'\s*\|\s*/g, '');

// 4. Remove the block rendering CalendarSync conditionally
content = content.replace(/\s*\)\s*:\s*\(activeFilter === 'sync' && \(userRole === 'admin' \|\| userRole === 'agent'\)\)\s*\?\s*\(\s*<div className="space-y-8">\s*<SettingsSubNav[^>]+>\s*<CalendarSync[^>]+>\s*<\/div>/g, '');

// 5. Remove Auto-sync iCal every 30 minutes
content = content.replace(/\s*\/\/\s*Auto-sync iCal every 30 minutes.*?return \(\) => \{\s*clearInterval\(intervalId\);\s*\};\s*\}, \[userRole\]\);/s, '');

content = content.replace(/'sync',\s*/g, '');

fs.writeFileSync('src/App.tsx', content);
