// small launcher so running `node practice.js` works from project root
require('./src/index.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'message.txt');
fs.writeFileSync(filePath, 'Hello from Node.js practice.js! this is a great backend approach');
console.log('Wrote message to', filePath);
