const fs = require('fs');
let file = 'src/pages/FrsSearch.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /<span className="material-symbols-outlined bg-primary-fixed text-black px-1 border border-black text-2xl">storage<\/span>/g,
    `<span className="material-symbols-outlined bg-primary-fixed text-black px-1 border border-black text-2xl">{db.name === 'CCTNS' ? 'local_police' : db.name === 'VAHAN' ? 'directions_car' : db.name === 'SARATHI' ? 'badge' : db.name === 'ICJS' ? 'gavel' : 'database'}</span>`
);

// One more check to ensure Ahmedabad/Maninagar wasn't missed.
// The user asked "remove all ahmedabad references and replace them with delhi onews"
console.log(content.match(/Ahmedabad/gi));
console.log(content.match(/Maninagar/gi));

fs.writeFileSync(file, content);
console.log("Done");
