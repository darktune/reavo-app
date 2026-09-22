import fs from 'fs';
import path from 'path';

const buf = fs.readFileSync('Iphone Pricelist.psd');
console.log('File size:', buf.length);

// Check Photoshop header
const signature = buf.slice(0, 4).toString('ascii'); // 8BPS
const version = buf.readUInt16BE(4);
const channels = buf.readUInt16BE(12);
const height = buf.readUInt32BE(14);
const width = buf.readUInt32BE(18);
const depth = buf.readUInt16BE(22);
const colorMode = buf.readUInt16BE(24);

console.log({ signature, version, channels, height, width, depth, colorMode });

// Let's find all occurrences of "8BIM"
let count8BIM = 0;
const keys8BIM = {};
for (let i = 0; i < buf.length - 8; i++) {
  if (buf[i] === 0x38 && buf[i+1] === 0x42 && buf[i+2] === 0x49 && buf[i+3] === 0x4D) { // 8BIM
    count8BIM++;
    const key = buf.slice(i+4, i+8).toString('ascii');
    keys8BIM[key] = (keys8BIM[key] || 0) + 1;
  }
}
console.log('Total 8BIM markers:', count8BIM);
console.log('8BIM keys:', keys8BIM);
