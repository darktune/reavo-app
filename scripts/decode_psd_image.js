import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function decodePackBits(input, outLen) {
  const output = Buffer.alloc(outLen);
  let inPos = 0;
  let outPos = 0;

  while (inPos < input.length && outPos < outLen) {
    let header = input.readInt8(inPos++);
    if (header >= 0) {
      // Literal run: 1 + header bytes
      const count = 1 + header;
      for (let i = 0; i < count && inPos < input.length && outPos < outLen; i++) {
        output[outPos++] = input[inPos++];
      }
    } else if (header > -128) {
      // Replicate run: 1 - header bytes
      const count = 1 - header;
      const val = input[inPos++];
      for (let i = 0; i < count && outPos < outLen; i++) {
        output[outPos++] = val;
      }
    }
  }
  return output;
}

const files = [
  'Ipad Mini Pricelist.psd',
  'Ipad Pricelist.psd',
  'Iphone Pricelist.psd',
  'Ipods Pricelist.psd',
  'Macbook Pricelist.psd'
];

for (const file of files) {
  const filePath = path.resolve('.', file);
  if (!fs.existsSync(filePath)) continue;
  const buf = fs.readFileSync(filePath);

  const channels = buf.readUInt16BE(12);
  const height = buf.readUInt32BE(14);
  const width = buf.readUInt32BE(18);
  const depth = buf.readUInt16BE(22);

  // Section 2: Color Mode Data
  let pos = 26;
  const colorDataLen = buf.readUInt32BE(pos);
  pos += 4 + colorDataLen;

  // Section 3: Image Resources
  const imgResLen = buf.readUInt32BE(pos);
  pos += 4 + imgResLen;

  // Section 4: Layer and Mask Information
  const layerMaskLen = buf.readUInt32BE(pos);
  pos += 4 + layerMaskLen;

  // Section 5: Image Data
  const compression = buf.readUInt16BE(pos);
  pos += 2;

  console.log(`\nDecoding ${file}: ${width}x${height}, channels: ${channels}, compression: ${compression}`);

  if (compression === 0) {
    // Raw
    const planeSize = width * height;
    const rgba = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        rgba[idx * 4 + 0] = buf[pos + idx];
        rgba[idx * 4 + 1] = buf[pos + planeSize + idx];
        rgba[idx * 4 + 2] = buf[pos + planeSize * 2 + idx];
        rgba[idx * 4 + 3] = channels > 3 ? buf[pos + planeSize * 3 + idx] : 255;
      }
    }
    const outPng = path.resolve('C:/Users/USER/.gemini/antigravity/brain/25158a57-eed4-449f-b322-b8f786b3013e/scratch', file.replace('.psd', '.png'));
    await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toFile(outPng);
    console.log(`✅ Saved ${outPng}`);
  } else if (compression === 1) {
    // RLE (PackBits)
    const scanlineCount = channels * height;
    const scanlineByteCounts = [];
    for (let i = 0; i < scanlineCount; i++) {
      scanlineByteCounts.push(buf.readUInt16BE(pos));
      pos += 2;
    }

    const decodedChannels = [];
    for (let c = 0; c < channels; c++) {
      const channelBufs = [];
      for (let y = 0; y < height; y++) {
        const len = scanlineByteCounts[c * height + y];
        const slice = buf.slice(pos, pos + len);
        pos += len;
        const decodedLine = decodePackBits(slice, width);
        channelBufs.push(decodedLine);
      }
      decodedChannels.push(Buffer.concat(channelBufs));
    }

    const rgba = Buffer.alloc(width * height * 4);
    const rPlane = decodedChannels[0];
    const gPlane = decodedChannels[1];
    const bPlane = decodedChannels[2];
    const aPlane = channels > 3 ? decodedChannels[3] : null;

    for (let i = 0; i < width * height; i++) {
      rgba[i * 4 + 0] = rPlane[i];
      rgba[i * 4 + 1] = gPlane[i];
      rgba[i * 4 + 2] = bPlane[i];
      rgba[i * 4 + 3] = aPlane ? aPlane[i] : 255;
    }

    const outPng = path.resolve('C:/Users/USER/.gemini/antigravity/brain/25158a57-eed4-449f-b322-b8f786b3013e/scratch', file.replace('.psd', '.png'));
    await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toFile(outPng);
    console.log(`✅ Saved ${outPng}`);
  } else {
    console.log(`Unsupported compression: ${compression}`);
  }
}
