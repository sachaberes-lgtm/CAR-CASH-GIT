import fs from 'node:fs';
export default async function (c, [f = 'profil.cpuprofile', s = '8']) {
  await c.cmd('Profiler.enable'); await c.cmd('Profiler.start');
  await new Promise((r) => setTimeout(r, +s * 1000));
  const r = await c.cmd('Profiler.stop', {}, 180000); fs.writeFileSync(f, JSON.stringify(r.profile)); console.log('profil', f, r.profile.nodes.length, 'nœuds');
}
