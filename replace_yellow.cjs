const fs = require('fs');

const files = [
  'src/pages/FrsSearch.tsx',
  'src/pages/Anomalies.tsx',
  'src/pages/GisMap.tsx',
  'src/pages/Alerts.tsx',
  'src/pages/CctvFeeds.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/text-primary-fixed\s+bg-black/g, 'bg-primary-fixed text-black border border-black');
    content = content.replace(/text-3xl\s+text-primary-fixed\s+bg-black/g, 'text-3xl bg-primary-fixed text-black border border-black');
    content = content.replace(/text-2xl\s+text-primary-fixed\s+bg-black/g, 'text-2xl bg-primary-fixed text-black border border-black');
    
    // general replacement
    content = content.replace(/text-primary-fixed/g, 'bg-primary-fixed text-black px-1 border border-black');
    content = content.replace(/text-\[\#ffe600\]/g, 'bg-[#ffe600] text-black px-1 border border-black');
    
    // clean up overlapping
    content = content.replace(/bg-primary-fixed text-black px-1 border border-black\s+bg-black/g, 'bg-primary-fixed text-black border border-black');
    
    fs.writeFileSync(file, content);
  }
});
console.log("Done");
