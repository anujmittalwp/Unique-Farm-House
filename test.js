const fs2 = require('fs');
let content = fs2.readFileSync('src/App.tsx', 'utf-8');
console.log(content.length);
