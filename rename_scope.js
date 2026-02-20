const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(__dirname);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('@rterizz23/peyek-')) {
        content = content.replace(/@peyek\//g, '@rterizz23/peyek-');
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
