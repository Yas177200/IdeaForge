const sharp = require('sharp');


async function compressToTarget(inputBuffer, {
  maxBytes,
  maxWidth,
  maxHeight,
  background = { r: 255, g: 255, b: 255 } 
}) {
  
  let pipeline = sharp(inputBuffer).rotate().resize({
    width: maxWidth,
    height: maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
    background
  });


  for (let q = 82; q >= 45; q -= 7) {
    const out = await pipeline.webp({ quality: q }).toBuffer({ resolveWithObject: true });
    if (out.data.length <= maxBytes) {
      return { buffer: out.data, info: { ...out.info, quality: q } };
    }
  }

  const out = await pipeline.webp({ quality: 45 }).toBuffer({ resolveWithObject: true });
  return { buffer: out.data, info: { ...out.info, quality: 45 } };
}

module.exports = { compressToTarget };
