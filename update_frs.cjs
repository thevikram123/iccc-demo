const fs = require('fs');
let file = 'src/pages/FrsSearch.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. set zone alert thresholds automatically dont have sliders
content = content.replace(/<input type="range".*?\/>/g, (match) => {
    // extract defaultValue
    let val = match.match(/defaultValue="(\d+)"/);
    let pct = val ? val[1] : '85';
    return `<div className="w-full h-1 bg-surface-container border border-black"><div className="h-full bg-black" style={{ width: '${pct}%' }}></div></div><div className="mt-2 font-mono text-[10px] text-black font-bold uppercase">Threshold Automatically Set</div>`;
});

// 2. replace all grey text with black text in the frs flow
content = content.replace(/text-black\/[1-9]0/g, 'text-black');
// Also replace text-gray-X if any
content = content.replace(/text-gray-\d00/g, 'text-black');

// 3. preview card profile icon black
// "in preview card also make the profile icon black" 
content = content.replace(/text-\[\#ffe600\] text-2xl/g, 'text-black text-2xl');
content = content.replace(/"material-symbols-outlined text-4xl text-black\/30"/g, '"material-symbols-outlined text-4xl text-black"');
content = content.replace(/"material-symbols-outlined text-black\/40 text-2xl"/g, '"material-symbols-outlined text-black text-2xl"');
content = content.replace(/"material-symbols-outlined text-3xl text-black\/30"/g, '"material-symbols-outlined text-3xl text-black"');

// 4. in fusion query have database icons
content = content.replace(
    /<span className="material-symbols-outlined bg-primary-fixed text-black border border-black text-2xl">storage<\/span>/g,
    `<span className="material-symbols-outlined bg-primary-fixed text-black border border-black text-2xl">{db.name === 'CCTNS' ? 'local_police' : db.name === 'VAHAN' ? 'directions_car' : db.name === 'SARATHI' ? 'badge' : db.name === 'ICJS' ? 'gavel' : 'database'}</span>`
);

content = content.replace(
    /\{c\.dbs\.map\(db => \(\s*<span key=\{db\} className="([^"]+)">\{db\}<\/span>\s*\)\)\}/g,
    `{c.dbs.map(db => ( <span key={db} className="$1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">{db === 'CCTNS' ? 'local_police' : db === 'VAHAN' ? 'directions_car' : db === 'SARATHI' ? 'badge' : db === 'ICJS' ? 'gavel' : 'database'}</span> {db}</span> ))}`
);

fs.writeFileSync(file, content);
console.log("Done");
