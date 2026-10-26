import fs from 'node:fs';
export default async function (c, [f = 'photo.png']) {
  const r = await c.cmd('Page.captureScreenshot', { format: 'png' }, 60000);
  fs.writeFileSync(f, Buffer.from(r.data, 'base64')); console.log('photo', f);
}
